import { startRouter } from './router.js';
import { refreshFloaters } from './floaters.js';

const menuBtn = document.getElementById('menu-btn');
const nav = document.getElementById('nav');
const scrim = document.getElementById('scrim');
const view = document.getElementById('view');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  scrim.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
scrim.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

startRouter({ view, nav, onNavigate: () => setMenu(false) });
refreshFloaters();
