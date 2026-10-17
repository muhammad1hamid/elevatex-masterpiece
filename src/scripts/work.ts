const filters = document.querySelector<HTMLElement>('.work-filters');
const projects = [...document.querySelectorAll<HTMLElement>('.work-tile')];
const count = document.querySelector<HTMLElement>('.work-count');
if (filters && projects.length && count) {
  filters.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      'button[data-work-filter]',
    );
    if (!button) return;
    const selected = button.dataset.workFilter;
    const results = document.querySelector<HTMLElement>('#work-results');
    if (results) results.dataset.filtered = String(selected !== 'all');
    for (const control of filters.querySelectorAll('button'))
      control.setAttribute('aria-pressed', String(control === button));
    let visible = 0;
    for (const project of projects) {
      project.hidden =
        selected !== 'all' && project.dataset.industry !== selected;
      if (!project.hidden) visible++;
    }
    count.textContent = `${visible} website concept${visible === 1 ? '' : 's'}${selected === 'all' ? '' : ` — ${selected}`}`;
  });
  filters.hidden = false;
}
