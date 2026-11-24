import { h } from '../utils/dom.js';
import { APP_NAME } from './brand.js';
import { renderPending } from '../pages/pending.js';
import { renderDashboard } from '../pages/dashboard.js';

const DEFAULT_ROUTE = 'dashboard';

const routes = {
  dashboard: { title: 'Dashboard', render: renderDashboard },
  agentes: {
    title: 'Agentes',
    detail: 'Registro y estado de los cuatro agentes.',
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
    h('p', { class: 'lede' }, `Esta dirección no existe en ${APP_NAME}.`),
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
      if (!route) {
        view.replaceChildren(renderNotFound());
      } else {
        view.replaceChildren(route.render ? route.render() : renderPending(route));
      }
    } catch (error) {
      console.error(`${APP_NAME}: error al mostrar la sección`, error);
      view.replaceChildren(
        h('p', { class: 'status status-error', role: 'alert' },
          'No se pudo mostrar esta sección. Recarga la página.')
      );
    }

    markActive(nav, name);
    document.title = route ? `${route.title} · ${APP_NAME}` : APP_NAME;
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
    if (onNavigate) onNavigate();
  }

  window.addEventListener('hashchange', render);
  render();
}
