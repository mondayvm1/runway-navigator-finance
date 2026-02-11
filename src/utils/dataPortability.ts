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

    // For export: Keep snapshot_id in accounts/expenses so relationships are preserved
    // Strip only id, user_id, created_at, updated_at (these will be regenerated on import)
    const cleanRows = rows.map(row => {
      const { id, user_id, created_at, updated_at, ...rest } = row;
      // Keep snapshot_id - it will be mapped to new IDs during import
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
    
    // Map old snapshot IDs to new snapshot IDs to preserve relationships
    const snapshotIdMap = new Map<string, string>();

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

      // Special handling for financial_snapshots: create mapping from old IDs to new IDs
      if (table === 'financial_snapshots') {
        console.log('📸 Importing snapshots and creating ID mapping...');
        for (const snapshot of rows) {
          const oldId = snapshot.id as string;
          if (!oldId) continue;

          // Create new snapshot (without the old ID)
          const { id, user_id, created_at, updated_at, ...snapshotData } = snapshot;
          const { data: newSnapshot, error: snapshotError } = await supabase
            .from('financial_snapshots')
            .insert({
              ...snapshotData,
              user_id: userId,
            } as any)
            .select('id')
            .single();

          if (snapshotError) {
            console.error(`Error importing snapshot ${oldId}:`, snapshotError);
            skipped++;
            continue;
          }

          // Map old ID to new ID
          if (newSnapshot?.id) {
            snapshotIdMap.set(oldId, newSnapshot.id);
            console.log(`📸 Mapped snapshot ${oldId} -> ${newSnapshot.id}`);
            imported++;
          }
        }
        continue;
      }

      // For user_accounts and monthly_expenses, import ALL rows (including snapshot-linked ones)
      // and update snapshot_id references using our mapping
      let rowsToImport = rows;
      
      // Re-assign user_id and update snapshot_id references
      const insertRowsRaw = rowsToImport.map(row => {
        const { id, user_id, created_at, updated_at, snapshot_id, ...rest } = row;
        const newRow: any = {
          ...rest,
          user_id: userId,
        };

        // Update snapshot_id if it exists and we have a mapping
        if (snapshot_id && typeof snapshot_id === 'string' && snapshotIdMap.has(snapshot_id)) {
          newRow.snapshot_id = snapshotIdMap.get(snapshot_id);
          console.log(`🔄 Updated snapshot_id reference: ${snapshot_id} -> ${newRow.snapshot_id}`);
        } else if (table === 'monthly_expenses' && (!snapshot_id || snapshot_id === null)) {
          // For monthly_expenses, explicitly set snapshot_id to null for current expenses
          newRow.snapshot_id = null;
        } else if (snapshot_id && !snapshotIdMap.has(snapshot_id)) {
          // If snapshot_id exists but we don't have a mapping, it means the snapshot wasn't imported
          // Skip this row or set to null
          console.warn(`⚠️ Snapshot ${snapshot_id} not found in mapping, skipping snapshot-linked ${table} row`);
          return null;
        } else {
          // Preserve snapshot_id if it's null/undefined (current data)
          newRow.snapshot_id = snapshot_id || null;
        }

        return newRow;
      }).filter(row => row !== null);

      const insertRows = dedupeRows(table, insertRowsRaw as any);

      if (insertRows.length > 0) {
        const { error } = await supabase
          .from(table)
          .insert(insertRows as any);

        if (error) {
          console.error(`Error importing ${table}:`, error.message);
          skipped += insertRows.length;
        } else {
          imported += insertRows.length;
          console.log(`✅ Imported ${insertRows.length} ${table} records`);
        }
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
