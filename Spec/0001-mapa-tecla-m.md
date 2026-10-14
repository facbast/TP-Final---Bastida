# Spec 0001 — Tecla alternativa M para el mapa del piso

- Estado: Borrador
- Fecha de creación: 2026-10-14
- Fecha de implementación: pendiente
- Commit: pendiente
- Origen: reporte de usuario (Shift sin efecto en su equipo)
- Requisito: el mapa del piso entero debe mostrarse al pulsar Shift; como no
  responde, M actúa como alternativa con el mismo comportamiento (interruptor).
- Documentación: No aplica (detalle de presentación definido por el usuario).
- Decisiones: Shift como interruptor + M alternativa (pedido del usuario).
- Alcance: `src/ui/Minimap.js` (toggle por Shift/M), `src/scenes/MenuScene.js`
  (línea de controles).
- Criterios de aceptación: en un nivel, pulsar M muestra el piso entero y otra
  pulsación lo oculta; Shift conserva ese mismo comportamiento donde funcione.
- Verificación: `npm run build` OK; pendiente prueba en navegador por el usuario.
- Historial de estados: Borrador (2026-10-14).
