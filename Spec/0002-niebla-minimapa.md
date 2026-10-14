# Spec 0002 — Niebla de guerra en mapas

- Estado: Borrador
- Requisito: el minimapa y el mapa grande solo muestran lo explorado; el
  jugador registra un radio de 700 px a su alrededor y lo explorado persiste
  todo el piso. Paredes y entidades (enemigos, tesoros, portal) ocultos hasta
  explorarse; el jugador siempre visible.
- Alcance: `src/ui/Minimap.js` (set de celdas exploradas, filtros), `src/scenes/GameScene.js` (pasar grilla).
- Aceptación: zonas no visitadas en negro en ambos mapas; al acercarse aparecen
  paredes y puntos y quedan reveladas.
- Commit: pendiente
