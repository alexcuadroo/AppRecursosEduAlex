async function apiFetch(path) {
  const res = await fetch(`${API_ORIGIN}${path}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

function apiFetchResources(params = {}) {
  const q = new URLSearchParams();
  if (params.limit) q.set('limit', params.limit);
  if (params.offset) q.set('offset', params.offset);
  if (params.materiaId) q.set('materiaId', params.materiaId);
  if (params.anioId) q.set('anioId', params.anioId);
  if (params.tipoId) q.set('tipoId', params.tipoId);
  if (params.formatoId) q.set('formatoId', params.formatoId);
  return apiFetch(`/api/resources?${q.toString()}`);
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

    const asset = rel.assets?.find(a => a.name.includes('win') && a.name.endsWith('.zip'));
    const dlUrl = asset?.browser_download_url || rel.html_url;

    const banner = document.createElement('div');
    banner.className = 'update-banner';
    banner.innerHTML = `
      <span>Nueva versi\u00f3n disponible: <strong>${latestTag}</strong></span>
      <a href="${dlUrl}" target="_blank" class="btn btn-update">Descargar</a>
      <a href="${rel.html_url}" target="_blank" class="btn btn-changelog">Nota de Cambios</a>
      <button class="btn-update-dismiss" aria-label="Cerrar">&times;</button>
    `;
    banner.querySelector('.btn-update-dismiss').addEventListener('click', () => banner.remove());
    $('app').prepend(banner);
  } catch { }
}
