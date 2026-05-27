# Changelog

## [0.2.2] - 2026-05-27

### Cambiado
- Eliminada extensión Node.js (`api-proxy`) que actuaba como proxy hacia la API
- Migrado a `fetch` directo desde el frontend a `api-app.edualex.uy`
- Deshabilitado `enableExtensions` y removida config del proxy en `neutralino.config.json`
- Inspect deshabilitado al inicio de la app

## [0.2.1] - 2026-05-27

### Corregido
- Code review: eliminada variable CSS `--accent` sin uso
- Code review: limpieza de propiedades redundantes en `.btn-changelog`
- Code review: Google Fonts reemplazadas por fuentes del sistema
- Code review: escape HTML en `buildCard` (previene XSS)
- Code review: race condition en `loadResources` con cambio rápido de pestañas
- Code review: debounce en botón "Abrir" para evitar requests duplicados
- Code review: parámetro `after` sin uso eliminado de `apiFetchResources`
- Code review: uso consistente del helper `$()` en todo el código
- Sincronización de versión entre `main.js` y `neutralino.config.json`

## [0.2.0] - 2026-05-27

### Añadido
- Banner de actualización con enlace "Nota de Cambios" a la release de GitHub
- Scrollbar thin azul con transparencia

### Cambiado
- Rediseño completo de UI con tema oscuro estilo Vercel
- Badges con bordes de color: materia (verde), tipo (azul), formato (naranja), año (púrpura)
- Fuentes del sistema en lugar de Google Fonts
- Pestaña "Últimos" limita a 10 recursos, "Más visitados" a 5

## [0.1.0] - 2026-05-20

### Inicial
- App Neutralinojs para recursos educativos de EduAlex
- Filtros por materia, año, tipo, formato y búsqueda
- Pestañas: Todos, Últimos, Más visitados
- Paginación
- API proxy para comunicación con backend
- Detección de actualizaciones desde GitHub Releases
