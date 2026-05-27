function getFilterValue(key) {
  const m = { materia: 'materiaId', anio: 'anioId', tipo: 'tipoId', formato: 'formatoId' };
  return state[m[key]];
}

function setFilterValue(key, val) {
  const m = { materia: 'materiaId', anio: 'anioId', tipo: 'tipoId', formato: 'formatoId' };
  state[m[key]] = val;
}

let openDropdown = null;

function toggleDropdown(key) {
  const dd = $(`dd-${key}`);
  const btn = dd.parentElement.querySelector('.pill-btn');
  if (openDropdown && openDropdown !== dd) {
    openDropdown.classList.remove('open');
    openDropdown.previousElementSibling?.classList.remove('open');
    openDropdown.previousElementSibling?.setAttribute('aria-expanded', 'false');
  }
  const isOpen = dd.classList.toggle('open');
  btn.classList.toggle('open');
  btn.setAttribute('aria-expanded', isOpen);
  openDropdown = isOpen ? dd : null;
}

function closeAllDropdowns() {
  $$('.pill-dropdown.open').forEach(d => d.classList.remove('open'));
  $$('.pill-btn.open').forEach(b => {
    b.classList.remove('open');
    b.setAttribute('aria-expanded', 'false');
  });
  openDropdown = null;
}

function selectPillChip(key, id) {
  const current = getFilterValue(key);
  const newVal = current === id ? null : id;
  setFilterValue(key, newVal);
  updatePillUI(key);
  renderActiveFilters();
  closeAllDropdowns();
  state.offset = 0;
  loadResources();
}

function updatePillUI(key) {
  const val = getFilterValue(key);
  const btn = document.querySelector(`.filter-pill[data-filter="${key}"] .pill-btn`);
  const label = FILTER_LABELS[key];
  if (val) {
    const name = lookupName(catalogs[`${key}s`], val) || label;
    btn.innerHTML = `${escapeHtml(name)} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>`;
    btn.classList.add('active');
  } else {
    btn.innerHTML = `${label} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>`;
    btn.classList.remove('active');
  }
  const chips = $(`dd-${key}`).querySelectorAll('.pill-chip');
  chips.forEach(chip => {
    const isActive = chip.dataset.id == val;
    chip.classList.toggle('active', isActive);
    chip.setAttribute('aria-selected', isActive);
  });
}

function populatePill(key, items) {
  const dd = $(`dd-${key}`);
  dd.innerHTML = items.map(item => `
    <button class="pill-chip" data-id="${item.id}" data-key="${key}" role="option" aria-selected="false">
      <span class="check"></span>
      ${escapeHtml(item.nombre)}
    </button>
  `).join('');
  dd.addEventListener('click', e => {
    const chip = e.target.closest('.pill-chip');
    if (!chip) return;
    selectPillChip(chip.dataset.key, chip.dataset.id);
  });
}

async function loadResources() {
  const rid = ++loadRequestId;
  state.loading = true;
  showLoading();
  try {
    let data, total;

    if (state.tab === 'latest') {
      const res = await apiFetch('/api/resources/latest?limit=10');
      data = res.data ?? res;
      total = data.length;
    } else if (state.tab === 'top') {
      const res = await apiFetch('/api/resources/top-visited?limit=5');
      data = (res.data ?? []).map(item => item.recurso || item);
      total = data.length;
    } else {
      const params = {
        limit: state.search ? 200 : state.limit,
        offset: state.search ? 0 : state.offset,
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

    if (rid !== loadRequestId) return;
    state.data = data;
    hideLoading();
    renderGrid(data);
    if (state.tab === 'all' && !state.search) {
      renderPagination(total, state.limit, state.offset);
    } else {
      $('pagination').classList.add('hidden');
    }
  } catch (err) {
    if (rid !== loadRequestId) return;
    hideLoading();
    showError(`No se pudieron cargar los recursos: ${err.message}`);
  }
  state.loading = false;
}
