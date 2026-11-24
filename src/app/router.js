import { h } from '../utils/dom.js';
import { renderPending } from '../pages/pending.js';

const DEFAULT_ROUTE = 'dashboard';

const routes = {
  dashboard: {
    title: 'Dashboard',
    detail: 'Resumen de tareas, aprobaciones, agentes, archivos y conexiones.',
    availability: 'Llega en la siguiente entrega de la Fase 1.'
  },
  agentes: {
    title: 'Agentes',
    detail: 'Registro y estado de los cuatro agentes de GAUSS.',
    availability: 'Disponible en la Fase 3.'
  },
  archivos: {
    title: 'Archivos',
    detail: 'Importar, limpiar y exportar archivos XLSX y CSV.',
    availability: 'Disponible en la Fase 2.'
  },
  conexiones: {
    title: 'Conexiones',
    detail: 'Conectar y desconectar Google Sheets y Gmail.',
    availability: 'Disponible desde la Fase 5.'
  },
  aprobaciones: {
    title: 'Aprobaciones',
    detail: 'Revisar y autorizar operaciones antes de que se ejecuten.',
    availability: 'Disponible en la Fase 3.'
  },
  historial: {
    title: 'Historial',
    detail: 'Registro de ejecuciones y operaciones.',
    availability: 'Disponible en la Fase 3.'
  },
  configuracion: {
    title: 'Configuración',
    detail: 'Preferencias y permisos de la plataforma.',
    availability: 'Se define en una fase posterior.'
  }
};

function currentRoute() {
  const name = location.hash.replace(/^#\/?/, '').split('?')[0];
  return name || DEFAULT_ROUTE;
}

function renderNotFound() {
  return h('section', { class: 'page' },
    h('h1', {}, 'Página no encontrada'),
    h('p', { class: 'lede' }, 'Esta dirección no existe en GAUSS.'),
    h('p', {}, h('a', { href: '#/dashboard' }, 'Ir al Dashboard'))
  );
}

function markActive(nav, name) {
  nav.querySelectorAll('a').forEach((link) => {
    if (link.getAttribute('href') === `#/${name}`) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

export function startRouter({ view, nav, onNavigate }) {
  function render() {
    const name = currentRoute();
    const route = Object.prototype.hasOwnProperty.call(routes, name) ? routes[name] : null;

    try {
      view.replaceChildren(route ? renderPending(route) : renderNotFound());
    } catch (error) {
      console.error('GAUSS: error al mostrar la sección', error);
      view.replaceChildren(
        h('p', { class: 'status status-error', role: 'alert' },
          'No se pudo mostrar esta sección. Recarga la página.')
      );
    }

    markActive(nav, name);
    document.title = route ? `${route.title} · GAUSS` : 'GAUSS';
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
    if (onNavigate) onNavigate();
  }

  window.addEventListener('hashchange', render);
  render();
      }
