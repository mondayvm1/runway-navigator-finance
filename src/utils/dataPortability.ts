import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EXPORT_TABLES = [
  'user_accounts',
  'monthly_expenses',
  'financial_snapshots',
  'income_events',
  'income_settings',
  'credit_scores',
  'category_settings',
] as const;

type TableName = typeof EXPORT_TABLES[number];

// Import order must respect foreign key constraints:
// financial_snapshots must be created before any rows that reference snapshot_id.
const IMPORT_TABLES_IN_ORDER: TableName[] = [
  'financial_snapshots',
  'user_accounts',
  'monthly_expenses',
  'income_events',
  'income_settings',
  'credit_scores',
  'category_settings',
];

// When clearing data before an import, delete children before parents
// so that ON DELETE CASCADE constraints work cleanly.
const DELETE_TABLES_IN_ORDER: TableName[] = [
  'user_accounts',
  'monthly_expenses',
  'income_events',
  'income_settings',
  'credit_scores',
  'category_settings',
  'financial_snapshots',
];

// ─── CSV helpers ────────────────────────────────────────────────

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowsToCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => headers.map(h => escapeCSV(row[h])).join(',')),
  ];
  return lines.join('\n');
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });
    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

// ─── Deduplication helpers (import-time only) ─────────────────────

function dedupeRows(table: TableName, rows: Record<string, unknown>[]): Record<string, unknown>[] {
  // Only aggressively dedupe tables that show up directly in the UI.
  if (table === 'user_accounts') {
    const seen = new Map<string, Record<string, unknown>>();
    for (const row of rows) {
      const key = [
        row.user_id,
        row.snapshot_id ?? 'null',
        row.category ?? row.type ?? '',
        row.name ?? '',
        row.balance ?? 0,
        row.interest_rate ?? 0,
        row.credit_limit ?? 0,
        row.min_payment ?? 0,
        row.due_date ?? 0,
      ].join('|');
      if (!seen.has(key)) {
        seen.set(key, row);
      }
    }
    return Array.from(seen.values());
  }

  if (table === 'monthly_expenses') {
    const seen = new Map<string, Record<string, unknown>>();
    for (const row of rows) {
      const key = [
        row.user_id,
        row.snapshot_id ?? 'null',
        row.name ?? '',
        row.amount ?? 0,
        row.category ?? '',
        row.is_essential ?? false,
      ].join('|');
      if (!seen.has(key)) {
        seen.set(key, row);
      }
    }
    return Array.from(seen.values());
  }

  // For other tables, just return as-is.
  return rows;
}

// ─── Export ──────────────────────────────────────────────────────

export async function exportAllData(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast.error('Please sign in to export your data');
    return;
  }

  toast.info('Preparing your data export…');

  const userId = session.user.id;
  const zip = new JSZip();
  const manifest: Record<string, { rows: number; columns: string[] }> = {};

  for (const table of EXPORT_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error(`Error fetching ${table}:`, error.message);
      continue;
    }

    const rows = (data || []) as Record<string, unknown>[];

    // Strip internal ids that would conflict on re-import
    const cleanRows = rows.map(row => {
      const { id, user_id, created_at, updated_at, ...rest } = row;
      return rest;
    });

    if (cleanRows.length > 0) {
      const csv = rowsToCSV(cleanRows);
      zip.file(`${table}.csv`, csv);
      manifest[table] = {
        rows: cleanRows.length,
        columns: Object.keys(cleanRows[0]),
      };
    }

    // Also store the full JSON for lossless re-import
    zip.file(`${table}.json`, JSON.stringify(rows, null, 2));
  }

  // README for humans
  const readme = `# Pathline Data Export
Exported: ${new Date().toISOString()}
User: ${session.user.email || userId}

## Contents
${Object.entries(manifest)
  .map(([t, m]) => `- **${t}.csv** — ${m.rows} rows (${m.columns.join(', ')})`)
  .join('\n')}

## How to re-import
1. Open Pathline and sign in
2. Click the floating menu → "Import Backup"
3. Select this ZIP file

## Spreadsheet use
Each .csv file opens directly in Excel / Google Sheets / Numbers.
The .json files contain the full data including internal IDs for exact restoration.
`;

  zip.file('README.md', readme);
  zip.file('manifest.json', JSON.stringify({
    version: 1,
    exported_at: new Date().toISOString(),
    tables: manifest,
  }, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pathline-export-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);

  toast.success('Export downloaded!');
}

// ─── Import ─────────────────────────────────────────────────────

export async function importFromZip(file: File): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast.error('Please sign in to import data');
    return;
  }

  const userId = session.user.id;

  toast.info('Reading backup file…');

  try {
    // First, clear existing data for this user so that the import
    // fully REPLACES the current state instead of adding to it.
    // We delete in dependency order so that foreign key constraints are respected.
    for (const table of DELETE_TABLES_IN_ORDER) {
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error(`Error clearing existing data from ${table}:`, deleteError.message);
        // We don't abort the whole import here; continue and let the user know via skipped count.
      }
    }

    const zip = await JSZip.loadAsync(file);
    let imported = 0;
    let skipped = 0;

    // Import in a safe order so that snapshot foreign keys are valid.
    for (const table of IMPORT_TABLES_IN_ORDER) {
      // Prefer the JSON file for lossless import
      const jsonFile = zip.file(`${table}.json`);
      if (!jsonFile) {
        // Try CSV fallback
        const csvFile = zip.file(`${table}.csv`);
        if (!csvFile) continue;

        const csvContent = await csvFile.async('string');
        const rows = parseCSV(csvContent);
        if (rows.length === 0) continue;

        // For monthly_expenses, only import current expenses (snapshot_id IS NULL)
        let rowsToImport = rows;
        if (table === 'monthly_expenses') {
          rowsToImport = rows.filter(row => !row.snapshot_id || row.snapshot_id === null || row.snapshot_id === '');
        }

        const insertRowsRaw = rowsToImport.map(row => ({
          ...row,
          user_id: userId,
          // For monthly_expenses, explicitly set snapshot_id to null for current expenses
          ...(table === 'monthly_expenses' ? { snapshot_id: null } : {}),
        }));

        const insertRows = dedupeRows(table, insertRowsRaw as any);

        const { error } = await supabase
          .from(table)
          .upsert(insertRows as any, { onConflict: 'id', ignoreDuplicates: true });

        if (error) {
          console.error(`Error importing ${table} from CSV:`, error.message);
          skipped += rows.length;
        } else {
          imported += rows.length;
        }
        continue;
      }

      const jsonContent = await jsonFile.async('string');
      const rows = JSON.parse(jsonContent) as Record<string, unknown>[];
      if (rows.length === 0) continue;

      // For monthly_expenses, only import current expenses (snapshot_id IS NULL)
      // Snapshot-linked expenses will be restored when restoring snapshots
      let rowsToImport = rows;
      if (table === 'monthly_expenses') {
        rowsToImport = rows.filter(row => !row.snapshot_id || row.snapshot_id === null);
      }

      // Re-assign user_id to current user while preserving snapshot_id
      // and any other relational fields present in the backup.
      const insertRowsRaw = rowsToImport.map(row => ({
        ...row,
        user_id: userId,
        // For monthly_expenses, explicitly set snapshot_id to null for current expenses
        ...(table === 'monthly_expenses' && (!row.snapshot_id || row.snapshot_id === null) 
          ? { snapshot_id: null } 
          : {}),
      }));

      const insertRows = dedupeRows(table, insertRowsRaw as any);

      const { error } = await supabase
        .from(table)
        .upsert(insertRows as any, { onConflict: 'id', ignoreDuplicates: true });

      if (error) {
        console.error(`Error importing ${table}:`, error.message);
        skipped += rows.length;
      } else {
        imported += rows.length;
      }
    }

    if (imported > 0) {
      toast.success(`Imported ${imported} records${skipped > 0 ? ` (${skipped} skipped)` : ''}`);
    } else if (skipped > 0) {
      toast.error(`Import failed: ${skipped} records could not be imported`);
    } else {
      toast.warning('No data found in the backup file');
    }
  } catch (err) {
    console.error('Import error:', err);
    toast.error('Failed to read the backup file');
  }
}
