Neutralino.init();

Neutralino.events.on('windowClose', () => {
  Neutralino.app.exit();
});

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '0' || e.key === 'Add' || e.key === 'Subtract')) {
    e.preventDefault();
  }
});
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });
document.addEventListener('gesturechange', (e) => e.preventDefault());

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [materias, anios, tipos, formatos] = await Promise.all([
      apiFetch('/api/meta/materias'),
      apiFetch('/api/meta/anios'),
      apiFetch('/api/meta/tipos'),
      apiFetch('/api/meta/formatos')
    ]);
    catalogs = { materias, anios, tipos, formatos };
    populatePill('materia', materias);
    populatePill('tipo', tipos);
    populatePill('formato', formatos);
    populatePill('anio', anios);
  } catch (err) {
    console.error('Error loading catalogs:', err);
  }

  checkForUpdate();
  loadResources();

  /* Tabs */
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  /* Pill dropdown toggles */
  FILTER_KEYS.forEach(key => {
    const btn = document.querySelector(`.filter-pill[data-filter="${key}"] .pill-btn`);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(key);
    });
  });

  /* Close dropdowns on outside click */
  document.addEventListener('click', closeAllDropdowns);

  /* Search with debounce */
  const searchInput = $('filterSearch');
  const searchClear = $('searchClear');
  let searchTimer;

  function onSearchInput() {
    searchClear.classList.toggle('hidden', !searchInput.value);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = searchInput.value;
      state.offset = 0;
      loadResources();
    }, 400);
  }

  searchInput.addEventListener('input', onSearchInput);
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.add('hidden');
    state.search = '';
    state.offset = 0;
    loadResources();
    searchInput.focus();
  });

  /* Clear all filters */
  $('btnClearFilters').addEventListener('click', () => {
    FILTER_KEYS.forEach(key => {
      setFilterValue(key, null);
      updatePillUI(key);
    });
    $('filterSearch').value = '';
    searchClear.classList.add('hidden');
    state.search = '';
    state.offset = 0;
    renderActiveFilters();
    loadResources();
  });

  /* Pin tip dismiss */
  const pinTip = document.getElementById('pinTip');
  if (pinTip) {
    if (localStorage.getItem('pinTipDismissed')) pinTip.classList.add('dismissed');
    pinTip.querySelector('.pin-tip-dismiss')?.addEventListener('click', () => {
      pinTip.classList.add('dismissed');
      localStorage.setItem('pinTipDismissed', '1');
    });
  }
});
