export type CaseType =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'
  | 'sentence'
  | 'title'
  | 'unknown';

function isPureNumber(str: string): boolean {
  return /^\d+$/.test(str);
}

function splitWords(str: string): string[] {
  if (!str) return [];
  if (isPureNumber(str)) return [str];

  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-\s.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function capitalize(word: string): string {
  if (!word) return '';
  if (isPureNumber(word)) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function lowerWords(str: string): string[] {
  return splitWords(str).map((w) => w.toLowerCase());
}

export function toCamelCase(str: string): string {
  if (!str) return '';
  if (isPureNumber(str)) return str;
  const words = lowerWords(str);
  return words
    .map((word, i) => (i === 0 ? word : capitalize(word)))
    .join('');
}

export function toPascalCase(str: string): string {
  if (!str) return '';
  if (isPureNumber(str)) return str;
  return lowerWords(str).map(capitalize).join('');
}

export function toSnakeCase(str: string): string {
  if (!str) return '';
  if (isPureNumber(str)) return str;
  return lowerWords(str).join('_');
}

export function toKebabCase(str: string): string {
  if (!str) return '';
  if (isPureNumber(str)) return str;
  return lowerWords(str).join('-');
}

export function toConstantCase(str: string): string {
  if (!str) return '';
  if (isPureNumber(str)) return str;
  return lowerWords(str).join('_').toUpperCase();
}

export function toSentenceCase(str: string): string {
  if (!str) return '';
  if (isPureNumber(str)) return str;
  const words = lowerWords(str);
  if (words.length === 0) return '';
  return capitalize(words[0]) + (words.length > 1 ? ' ' + words.slice(1).join(' ') : '');
}

export function toTitleCase(str: string): string {
  if (!str) return '';
  if (isPureNumber(str)) return str;
  return lowerWords(str).map(capitalize).join(' ');
}

export function detectCase(str: string): CaseType {
  if (!str || isPureNumber(str)) return 'unknown';

  if (/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/.test(str)) return 'constant';
  if (str.includes('_') && !/[A-Z]/.test(str.replace(/_/g, ''))) return 'snake';
  if (str.includes('-') && !/[A-Z]/.test(str.replace(/-/g, ''))) return 'kebab';
  if (/^[a-z][a-zA-Z0-9]*$/.test(str) && /[A-Z]/.test(str)) return 'camel';
  if (/^[A-Z][a-zA-Z0-9]*$/.test(str) && /[a-z]/.test(str.slice(1))) return 'pascal';

  if (/^[A-Z][a-z]+(\s+[a-z]+)*$/.test(str)) return 'sentence';
  if (/^([A-Z][a-z]+\s+)+[A-Z][a-z]+$/.test(str) || /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(str)) {
    return 'title';
  }

  if (str.includes(' ')) {
    const words = str.split(/\s+/);
    if (words.every((w) => /^[A-Z]/.test(w))) return 'title';
    if (/^[A-Z]/.test(str)) return 'sentence';
  }

  return 'unknown';
}
