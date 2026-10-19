import { createCinematicMotion } from './animations/cinematic';
const motion = createCinematicMotion(document.body);
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
    motion.stop();
    const results = document.querySelector<HTMLElement>('#work-results');
    if (results) results.dataset.filtered = String(selected !== 'all');
    for (const control of filters.querySelectorAll('button'))
      control.setAttribute('aria-pressed', String(control === button));
    let visible = 0;
    for (const project of projects) {
      project.hidden =
        selected !== 'all' && project.dataset.industry !== selected;
      if (!project.hidden) {
        visible++;
        motion.play(project, [{ opacity: 0.65 }, { opacity: 1 }], {
          duration: 350,
        });
      }
    }
    count.textContent = `${visible} website concept${visible === 1 ? '' : 's'}${selected === 'all' ? '' : ` — ${selected}`}`;
  });
  filters.hidden = false;
}
window.addEventListener('pagehide', () => motion.stop());
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () =>
  motion.stop(),
);
