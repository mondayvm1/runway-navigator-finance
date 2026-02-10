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
    const zip = await JSZip.loadAsync(file);
    let imported = 0;
    let skipped = 0;

    for (const table of EXPORT_TABLES) {
      // Prefer the JSON file for lossless import
      const jsonFile = zip.file(`${table}.json`);
      if (!jsonFile) {
        // Try CSV fallback
        const csvFile = zip.file(`${table}.csv`);
        if (!csvFile) continue;

        const csvContent = await csvFile.async('string');
        const rows = parseCSV(csvContent);
        if (rows.length === 0) continue;

        const insertRows = rows.map(row => ({
          ...row,
          user_id: userId,
        }));

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

      // Re-assign user_id to current user
      const insertRows = rows.map(row => ({
        ...row,
        user_id: userId,
      }));

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
