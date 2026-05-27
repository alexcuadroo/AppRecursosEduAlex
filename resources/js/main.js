const APP_VERSION = '0.1.0';
const API_ORIGIN = 'https://rec.edualex.uy';
const EXT_ID = 'edu.alex.apiproxy';
const useExtension = typeof Neutralino !== 'undefined' && Neutralino.extensions;

const pendingReqs = new Map();

if (useExtension) {
  Neutralino.events.on('apiResponse', (ev) => {
    const { id, status, body, error } = ev.detail;
    const p = pendingReqs.get(id);
    if (!p) return;
    pendingReqs.delete(id);
    if (error) return p.reject(new Error(error));
    if (status >= 400) return p.reject(new Error(`Error ${status}`));
    p.resolve(body);
  });
}

function apiFetch(path, origin) {
  if (useExtension) {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      pendingReqs.set(id, { resolve, reject });
      Neutralino.extensions.dispatch(EXT_ID, 'apiRequest', {
        id, method: 'GET', path, origin: origin || API_ORIGIN
      });
      setTimeout(() => {
        if (pendingReqs.has(id)) {
          pendingReqs.delete(id);
          reject(new Error('Timeout'));
        }
      }, 15000);
    });
  }
  return directFetch(`${origin || API_ORIGIN}${path}`);
}

async function directFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

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

function showLoading() {
  $('loading').classList.remove('hidden');
  $('error').classList.add('hidden');
  $('resource-grid').innerHTML = '';
  $('pagination').classList.add('hidden');
}

function hideLoading() {
  $('loading').classList.add('hidden');
}

function showError(msg) {
  $('error').classList.remove('hidden');
  $('error').textContent = msg;
  hideLoading();
}

function apiFetchResources(params = {}) {
  const q = new URLSearchParams();
  if (params.limit) q.set('limit', params.limit);
  if (params.offset) q.set('offset', params.offset);
  if (params.materiaId) q.set('materiaId', params.materiaId);
  if (params.anioId) q.set('anioId', params.anioId);
  if (params.tipoId) q.set('tipoId', params.tipoId);
  if (params.formatoId) q.set('formatoId', params.formatoId);
  if (params.after) q.set('after', params.after);
  return apiFetch(`/api/resources?${q.toString()}`);
}

async function loadCatalogs() {
  try {
    const [materias, anios, tipos, formatos] = await Promise.all([
      apiFetch('/api/meta/materias'),
      apiFetch('/api/meta/anios'),
      apiFetch('/api/meta/tipos'),
      apiFetch('/api/meta/formatos')
    ]);
    catalogs = { materias, anios, tipos, formatos };
    populateSelect('filterMateria', materias, 'id', 'nombre');
    populateSelect('filterAnio', anios, 'id', 'nombre');
    populateSelect('filterTipo', tipos, 'id', 'nombre');
    populateSelect('filterFormato', formatos, 'id', 'nombre');
  } catch (err) {
    console.error('Error loading catalogs:', err);
  }
}

function populateSelect(id, items, valueKey, labelKey) {
  const sel = $(id);
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item[valueKey];
    opt.textContent = item[labelKey];
    sel.appendChild(opt);
  });
}

function lookupName(catalog, id) {
  if (!id || !catalog) return '';
  const item = catalog.find(x => x.id === id);
  return item ? item.nombre : '';
}

async function openResource(uuid) {
  try {
    const data = await apiFetch(`/api/resources/${uuid}/link?disposition=inline`);
    if (data.url) window.open(data.url, '_blank');
  } catch (err) {
    console.error('Error al abrir recurso:', err);
  }
}

async function checkForUpdate() {
  try {
    const res = await fetch('https://api.github.com/repos/alexcuadroo/AppRecursosEduAlex/releases/latest');
    if (!res.ok) return;
    const rel = await res.json();
    const latestTag = rel.tag_name;
    const currentTag = `v.${APP_VERSION}`;
    if (latestTag === currentTag) return;

    const asset = rel.assets?.find(a => a.name.includes('win') || a.name.endsWith('.exe'));
    const dlUrl = asset?.browser_download_url || rel.html_url;

    const banner = document.createElement('div');
    banner.className = 'update-banner';
    banner.innerHTML = `
      <span>Nueva versi\u00f3n disponible: <strong>${latestTag}</strong></span>
      <a href="${dlUrl}" target="_blank" class="btn btn-update">Descargar</a>
      <button class="btn-update-dismiss" aria-label="Cerrar">&times;</button>
    `;
    banner.querySelector('.btn-update-dismiss').addEventListener('click', () => banner.remove());
    document.getElementById('app').prepend(banner);
  } catch { }
}

function buildCard(r) {
  const card = document.createElement('div');
  card.className = 'resource-card';
  card.innerHTML = `
    <h3>${r.titulo || 'Sin título'}</h3>
    <div class="meta">
      ${r.materiaId ? `<span class="badge badge-materia">${lookupName(catalogs.materias, r.materiaId)}</span>` : ''}
      ${r.tipoId ? `<span class="badge badge-tipo">${lookupName(catalogs.tipos, r.tipoId)}</span>` : ''}
      ${r.formatoId ? `<span class="badge badge-formato">${lookupName(catalogs.formatos, r.formatoId)}</span>` : ''}
      ${r.anioId ? `<span class="badge badge-anio">${lookupName(catalogs.anios, r.anioId)}</span>` : ''}
    </div>
    <div class="stats">
      <span>👁 ${r.descargasTotales ?? 0} descargas</span>
    </div>
    <div class="actions">
      <button class="btn btn-primary">Abrir</button>
    </div>
  `;
  card.querySelector('.btn-primary').addEventListener('click', () => openResource(r.uuid));
  return card;
}

function applySearch(data) {
  if (!state.search) return data;
  const q = state.search.toLowerCase();
  return data.filter(r =>
    (r.titulo && r.titulo.toLowerCase().includes(q)) ||
    (r.descripcion && r.descripcion.toLowerCase().includes(q)) ||
    (r.palabrasClave && r.palabrasClave.toLowerCase().includes(q))
  );
}

function renderGrid(data) {
  const grid = $('resource-grid');
  const filtered = applySearch(data);
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="loading" style="grid-column:1/-1">Sin resultados</div>';
    return;
  }
  grid.innerHTML = '';
  filtered.forEach(r => grid.appendChild(buildCard(r)));
}

function renderPagination(total, limit, offset) {
  const el = $('pagination');
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1 && state.tab === 'all') {
    el.classList.add('hidden');
    return;
  }

  el.classList.remove('hidden');
  let html = '';
  html += `<button class="page-btn" data-page="prev" ${currentPage <= 1 ? 'disabled' : ''}>&lt;</button>`;

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (startPage > 2) html += `<span class="page-info">...</span>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span class="page-info">...</span>`;
    html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
  }

  html += `<button class="page-btn" data-page="next" ${currentPage >= totalPages ? 'disabled' : ''}>&gt;</button>`;
  html += `<span class="page-info">${total} resultados</span>`;
  el.innerHTML = html;

  el.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.page;
      if (p === 'prev') changePage(currentPage - 1);
      else if (p === 'next') changePage(currentPage + 1);
      else changePage(parseInt(p));
    });
  });
}

function changePage(page) {
  state.offset = (page - 1) * state.limit;
  loadResources();
}

async function loadResources() {
  state.loading = true;
  showLoading();
  try {
    let data, total;

    if (state.tab === 'latest') {
      const res = await apiFetch('/api/resources/latest?limit=50');
      data = res.data ?? res;
      total = data.length;
    } else if (state.tab === 'top') {
      const res = await apiFetch('/api/resources/top-visited?limit=50');
      data = res.data ?? res;
      total = data.length;
    } else {
      const params = {
        limit: state.limit,
        offset: state.offset,
        materiaId: state.materiaId || undefined,
        anioId: state.anioId || undefined,
        tipoId: state.tipoId || undefined,
        formatoId: state.formatoId || undefined
      };
      const res = await apiFetchResources(params);
      data = res.data;
      total = res.total;
      state.total = total;
    }

    state.data = data;
    hideLoading();
    renderGrid(data);
    if (state.tab === 'all') {
      renderPagination(total, state.limit, state.offset);
    } else {
      $('pagination').classList.add('hidden');
    }
  } catch (err) {
    hideLoading();
    showError(`No se pudieron cargar los recursos: ${err.message}`);
  }
  state.loading = false;
}

function switchTab(tab) {
  state.tab = tab;
  state.offset = 0;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  loadResources();
}

function onFilterChange() {
  state.materiaId = $('filterMateria').value || null;
  state.anioId = $('filterAnio').value || null;
  state.tipoId = $('filterTipo').value || null;
  state.formatoId = $('filterFormato').value || null;
  state.offset = 0;
  loadResources();
}

Neutralino.init();

Neutralino.events.on('windowClose', () => {
  Neutralino.app.exit();
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadCatalogs();
  checkForUpdate();
  loadResources();

  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  ['filterMateria', 'filterAnio', 'filterTipo', 'filterFormato'].forEach(id => {
    $(id).addEventListener('change', onFilterChange);
  });

  let searchTimer;
  $('filterSearch').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = $('filterSearch').value;
      renderGrid(state.data);
    }, 300);
  });

  $('btnClearFilters').addEventListener('click', () => {
    ['filterMateria', 'filterAnio', 'filterTipo', 'filterFormato'].forEach(id => {
      $(id).value = '';
    });
    $('filterSearch').value = '';
    state.search = '';
    state.materiaId = null;
    state.anioId = null;
    state.tipoId = null;
    state.formatoId = null;
    state.offset = 0;
    loadResources();
  });
});
