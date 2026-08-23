// Build a URL honoring Astro's base path (import.meta.env.BASE_URL).
// Local/dev/e2e build with base '/', the GitHub Pages build with base '/onkosygnal/'.
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL || '/';
  return base.replace(/\/?$/, '/') + path.replace(/^\//, '');
}
