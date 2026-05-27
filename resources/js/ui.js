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

function lookupName(catalog, id) {
  if (!id || !catalog) return '';
  const item = catalog.find(x => x.id == id);
  return item ? item.nombre : '';
}

function buildCard(r) {
  const card = document.createElement('article');
  card.className = 'resource-card';
  card.innerHTML = `
    <h3>${escapeHtml(r.titulo || 'Sin título')}</h3>
    <div class="meta">
      ${r.materiaId ? `<span class="badge badge-materia">${escapeHtml(lookupName(catalogs.materias, r.materiaId))}</span>` : ''}
      ${r.tipoId ? `<span class="badge badge-tipo">${escapeHtml(lookupName(catalogs.tipos, r.tipoId))}</span>` : ''}
      ${r.formatoId ? `<span class="badge badge-formato">${escapeHtml(lookupName(catalogs.formatos, r.formatoId))}</span>` : ''}
      ${r.anioId ? `<span class="badge badge-anio">${escapeHtml(lookupName(catalogs.anios, r.anioId))}</span>` : ''}
    </div>
    <div class="actions">
      <button class="btn btn-primary" aria-label="Abrir ${escapeHtml(r.titulo || 'recurso')}">Abrir</button>
      <span class="stats" aria-label="${r.descargasTotales ?? 0} descargas">↓ ${r.descargasTotales ?? 0}</span>
    </div>
  `;
  const btn = card.querySelector('.btn-primary');
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = 'Abriendo...';
    openResource(r.uuid).finally(() => {
      btn.disabled = false;
      btn.textContent = 'Abrir';
    });
  });
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

function switchTab(tab) {
  state.tab = tab;
  state.offset = 0;
  $$('.tab').forEach(t => {
    const isActive = t.dataset.tab === tab;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive);
  });
  loadResources();
}

function renderActiveFilters() {
  const container = $('activeFilters');
  const chips = $('activeChips');
  let hasActive = false;
  chips.innerHTML = '';

  FILTER_KEYS.forEach(key => {
    const val = getFilterValue(key);
    if (!val) return;
    hasActive = true;
    const name = lookupName(catalogs[`${key}s`], val) || val;
    const chip = document.createElement('span');
    chip.className = 'active-chip';
    chip.innerHTML = `${escapeHtml(name)} <button class="chip-remove" data-key="${key}" aria-label="Quitar">&times;</button>`;
    chip.querySelector('.chip-remove').addEventListener('click', () => {
      setFilterValue(key, null);
      updatePillUI(key);
      renderActiveFilters();
      state.offset = 0;
      loadResources();
    });
    chips.appendChild(chip);
  });

  container.classList.toggle('hidden', !hasActive);
}
