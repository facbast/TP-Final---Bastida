# Spec 0004 — Integración de Traducila

- Estado: Borrador
- Requisito: integrar Traducila oficial en el juego
  (project Rouge Egg, id 4fe9e02e-5d51-4c3b-8aba-9cb2a1e10b88), descargando el
  archivo oficial sin reconstruirlo y adaptando únicamente el proyecto.
- Alcance: `src/services/translations.js` (descarga literal + PROJECT_ID +
  quita de PT/DE por decisión del usuario), `src/enums/keys.js`, `languages.js`,
  `status.js`, `MenuScene.js`, `Hud.js`, `GameScene.js`.
- Aceptación: menú y HUD renderizan con getPhrase(KEYS); ES funciona sin red;
  EN consulta la API y actualiza; build OK.
- Commit: pendiente
