// Estado de la plataforma. Los indicadores del Dashboard salen de aquí.
export const AGENT_TOTAL = 4;

export const state = {
  tasks: [],          // { status: 'completed' | 'pending' | 'running' | 'awaiting_approval' }
  approvals: [],      // { status: 'pending' | 'approved' | 'rejected' }
  agents: [],         // agentes registrados y disponibles (Fase 3)
  processedFiles: [], // archivos procesados (Fase 2)
  executions: [],     // { name, status } (Fase 3)
  connections: [
    { id: 'local-files', name: 'Archivos locales', status: 'not-configured' },
    { id: 'google-sheets', name: 'Google Sheets', status: 'not-configured' },
    { id: 'gmail', name: 'Gmail', status: 'not-configured' }
  ]
};
