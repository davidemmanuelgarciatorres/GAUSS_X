import { h } from '../utils/dom.js';

export function renderPending({ title, detail, availability }) {
  return h('section', { class: 'page' },
    h('h1', {}, title),
    h('p', { class: 'lede' }, detail),
    h('p', { class: 'note' }, `Aún no disponible. ${availability}`)
  );
    }
