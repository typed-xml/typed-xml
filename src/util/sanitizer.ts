export function sanitize(value: string, escapeCharacters: Record<string, string>) {
  for (const [char, escape] of Object.entries(escapeCharacters)) {
    value = value.replaceAll(char, escape);
  }

  return value;
}

export function desanitize(value: string, escapeCharacters: Record<string, string>) {
  for (const [char, escape] of Object.entries(escapeCharacters)) {
    value = value.replaceAll(escape, char);
  }

  return value;
}