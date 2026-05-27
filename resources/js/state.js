const APP_VERSION = '0.3.0';
const API_ORIGIN = 'https://api-app.edualex.uy';

let loadRequestId = 0;

let state = {
  tab: 'all',
  materiaId: null,
  anioId: null,
  tipoId: null,
  formatoId: null,
  search: '',
  limit: 20,
  offset: 0,
  total: 0,
  data: [],
  loading: false
};

let catalogs = {};

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const FILTER_KEYS = ['materia', 'tipo', 'formato', 'anio'];
const FILTER_LABELS = { materia: 'Materia', anio: 'Año', tipo: 'Tipo', formato: 'Formato' };

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
