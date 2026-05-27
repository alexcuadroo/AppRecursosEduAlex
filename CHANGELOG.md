# Changelog

## [0.3.0] - 2026-05-27

### Añadido
- Barra de filtros superior con search protagónico y dropdown pills (Materia, Tipo, Formato, Año)
- Chips de filtros activos sobre el grid con botón "Limpiar todo"
- Botón ✕ para limpiar búsqueda
- Sidebar colapsable para filtros avanzados (togglable desde ⚙)
- Pin tip sticky abajo a la derecha con persistencia en localStorage
- HTML semántico: `<article>`, `<nav>`, `<form role="search">`, roles ARIA, aria-labels
- Componentización de CSS (4 módulos) y JS (5 módulos)

### Cambiado
- Rediseño completo de filtros: selects reemplazados por chips seleccionables con dropdown
- Tabs movidos a la misma línea que el título
- Buscador movido a la derecha del header
- Hover en cards más marcado (translateY + shadow)
- Focus glow en inputs estilo Tailwind
- Debounce de búsqueda reducido a 400ms
- Orden de filtros consistente con badges: Materia → Tipo → Formato → Año

### Corregido
- Sincronización de versión entre state.js y neutralino.config.json
- lookupName usaba `===` y fallaba con tipos (string vs number)
- Dev script ahora modifica el JSON en memoria, sin archivos .bak

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
