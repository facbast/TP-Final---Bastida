# Spec 0005 — Botón de idioma en el menú

- Estado: Borrador
- Requisito: botón ES/EN en la pantalla de título que cambia el idioma en vivo
  usando el servicio oficial (`getTranslations`) y reconstruye los textos con
  `getPhrase` sin recargar la escena.
- Alcance: `src/scenes/MenuScene.js`.
- Aceptación: en el menú, pulsar el botón y cambia todos los textos al otro
  idioma; funciona también hacia atrás (EN → ES).
- Commit: pendiente
