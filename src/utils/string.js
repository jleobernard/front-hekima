export function sanitize(q) {
  if (q ) {
    return q.trim()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  }
  return null;
}