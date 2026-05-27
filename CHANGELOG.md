# Changelog

## [0.2.0] - 2026-05-27

### Añadido
- Banner de actualización con enlace "Nota de Cambios" que redirige a la release de GitHub
- Scrollbar thin azul con transparencia
- Protección contra race conditions al cambiar de pestaña rápidamente
- Debounce en botón "Abrir" para evitar múltiples requests simultáneas
- Escape HTML en títulos y nombres de catálogos (previene XSS)

### Cambiado
- Rediseño completo de UI con tema oscuro estilo Vercel (fondos negros, texto blanco, acentos azules)
- Badges rediseñados con bordes de color: materia (verde), tipo (azul), formato (naranja), año (púrpura)
- Fuentes del sistema en lugar de Google Fonts (offline-friendly)
- Pestaña "Últimos" limita a 10 recursos
- Pestaña "Más visitados" limita a 5 recursos
- Texto de estadísticas simplificado ("↓ 123" en vez de emoji descriptivo)

### Corregido
- Variable CSS `--accent` sin uso eliminada
- Clase `.btn-changelog` limpiada (hereda propiedades base de `.btn`)
- Parámetro `after` sin uso eliminado de `apiFetchResources`
- Consistencia en uso de helper `$()` en `checkForUpdate`
- Sincronización de versión entre `main.js` y `neutralino.config.json`

## [0.1.0] - 2026-05-20

### Inicial
- App Neutralinojs para recursos educativos de EduAlex
- Filtros por materia, año, tipo, formato y búsqueda
- Pestañas: Todos, Últimos, Más visitados
- Paginación
- API proxy para comunicación con backend
- Detección de actualizaciones desde GitHub Releases
