export function sanitize(q) {
  if (q ) {
    return q.trim()
      .normalize('NFD')
      .replace(/[^\\p{ASCII}]/g, '')
      .toLowerCase();
  }
  return null;
}