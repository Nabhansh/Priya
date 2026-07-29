export type HumanEntry = {
  id: string;
  title: string;
  category: string;
  url: string;
  username: string;
  password: string;
  notes: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export function entriesToCSV(entries: HumanEntry[]): string {
  const headers = ['Title', 'Category', 'URL', 'Username', 'Password', 'Notes', 'Favorite', 'Created At', 'Updated At'];
  
  const escapeCell = (val: string) => {
    if (!val) return '';
    if (val.includes('"') || val.includes(',') || val.includes('\n') || val.includes('\r')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = entries.map((e) => [
    e.title || '',
    e.category || 'General',
    e.url || '',
    e.username || '',
    e.password || '',
    e.notes || '',
    e.favorite ? 'Yes' : 'No',
    e.createdAt || new Date().toISOString(),
    e.updatedAt || new Date().toISOString(),
  ]);

  const csvLines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ];

  return csvLines.join('\r\n');
}

export function csvToEntries(csvText: string): HumanEntry[] {
  const lines = parseCSVLines(csvText);
  if (lines.length <= 1) return [];

  const headers = lines[0].map((h) => h.trim().toLowerCase());
  const titleIdx = headers.indexOf('title');
  const catIdx = headers.indexOf('category');
  const urlIdx = headers.indexOf('url');
  const userIdx = headers.indexOf('username');
  const passIdx = headers.indexOf('password');
  const notesIdx = headers.indexOf('notes');
  const favIdx = headers.indexOf('favorite');
  const createdIdx = headers.indexOf('created at');
  const updatedIdx = headers.indexOf('updated at');

  const results: HumanEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

    const title = titleIdx >= 0 && row[titleIdx] ? row[titleIdx].trim() : 'Untitled';
    const category = catIdx >= 0 && row[catIdx] ? row[catIdx].trim() : 'General';
    const url = urlIdx >= 0 && row[urlIdx] ? row[urlIdx].trim() : '';
    const username = userIdx >= 0 && row[userIdx] ? row[userIdx].trim() : '';
    const password = passIdx >= 0 && row[passIdx] ? row[passIdx].trim() : '';
    const notes = notesIdx >= 0 && row[notesIdx] ? row[notesIdx].trim() : '';
    const favVal = favIdx >= 0 && row[favIdx] ? row[favIdx].trim().toLowerCase() : '';
    const favorite = favVal === 'yes' || favVal === 'true' || favVal === '1';
    const createdAt = createdIdx >= 0 && row[createdIdx] ? row[createdIdx].trim() : new Date().toISOString();
    const updatedAt = updatedIdx >= 0 && row[updatedIdx] ? row[updatedIdx].trim() : new Date().toISOString();

    results.push({
      id: 'entry_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
      title,
      category,
      url,
      username,
      password,
      notes,
      favorite,
      createdAt,
      updatedAt,
    });
  }

  return results;
}

function parseCSVLines(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell);
        cell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        row.push(cell);
        lines.push(row);
        row = [];
        cell = '';
        if (char === '\r') i++;
      } else if (char !== '\r') {
        cell += char;
      }
    }
  }

  if (cell || row.length > 0) {
    row.push(cell);
    lines.push(row);
  }

  return lines;
}

export function downloadCSVFile(csvContent: string, filename = 'passwords_vault.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
