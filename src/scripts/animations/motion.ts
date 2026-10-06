/** Call only inside a client enhancement. Nothing imports this on the foundation page. */
export function observeReducedMotion(
  onChange: (reduced: boolean) => void,
): () => void {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const update = () => onChange(query.matches);
  update();
  query.addEventListener('change', update);
  return () => query.removeEventListener('change', update);
}
