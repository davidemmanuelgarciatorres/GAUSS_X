import { h } from '../utils/dom.js';
import { state, AGENT_TOTAL } from '../app/state.js';

const STATUS_LABELS = {
  'not-configured': 'Sin configurar',
  connected: 'Conectado',
  error: 'Con error'
};

function countBy(list, statuses) {
  return list.filter((item) => statuses.includes(item.status)).length;
}

function metric(label, value) {
  return h('div', { class: 'metric' }, h('dt', {}, label), h('dd', {}, String(value)));
}

export function renderDashboard() {
  const completed = countBy(state.tasks, ['completed']);
  const pending = countBy(state.tasks, ['pending', 'running', 'awaiting_approval']);
  const approvals = countBy(state.approvals, ['pending']);

  return h('section', { class: 'page' },
    h('h1', {}, 'Dashboard'),
    h('dl', { class: 'metrics' },
      metric('Tareas completadas', completed),
      metric('Tareas pendientes', pending),
      metric('Aprobaciones requeridas', approvals),
      metric('Agentes disponibles', `${state.agents.length} de ${AGENT_TOTAL}`),
      metric('Archivos procesados', state.processedFiles.length)
    ),
    h('h2', {}, 'Últimas ejecuciones'),
    state.executions.length === 0
      ? h('p', { class: 'empty' },
          'Todavía no hay ejecuciones. Aparecerán aquí cuando los agentes procesen archivos.')
      : h('ul', { class: 'rows' },
          state.executions.slice(0, 5).map((item) =>
            h('li', {}, h('span', {}, item.name), h('span', { class: 'tag' }, item.status)))),
    h('h2', {}, 'Conexiones'),
    h('ul', { class: 'rows' },
      state.connections.map((c) =>
        h('li', {}, h('span', {}, c.name),
          h('span', { class: 'tag' }, STATUS_LABELS[c.status] || 'Desconocido'))))
  );
}
