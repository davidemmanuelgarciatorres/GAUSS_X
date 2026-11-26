// Lector CSV propio (RFC 4180): comillas, comillas escapadas y saltos de línea dentro de comillas.
const CANDIDATES = [',', ';', '\t', '|'];
const SAMPLE_CHARS = 30000;
const SAMPLE_LINES = 10;

// Elige el separador que aparece igual de seguido en las primeras líneas (fuera de comillas).
export function detectDelimiter(text) {
  const sample = text.slice(0, SAMPLE_CHARS);
  let best = ',';
  let bestScore = -1;
  for (const candidate of CANDIDATES) {
    const counts = [];
    let inQuotes = false;
    let count = 0;
    for (let i = 0; i < sample.length && counts.length < SAMPLE_LINES; i += 1) {
      const ch = sample[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (inQuotes) {
        continue;
      } else if (ch === candidate) {
        count += 1;
      } else if (ch === '\n') {
        counts.push(count);
        count = 0;
      }
    }
    if (counts.length === 0) counts.push(count);
    const consistent = counts[0] > 0 && counts.every((c) => c === counts[0]);
    const score = consistent ? 1000 + counts[0] : counts.filter((c) => c > 0).length;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

export function parseCsv(text, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"' && field === '') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return {
    rows: rows.filter((r) => r.some((cell) => cell.trim() !== '')),
    unclosedQuotes: inQuotes
  };
                      }
