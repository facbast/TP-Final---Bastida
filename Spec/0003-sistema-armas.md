# Spec 0003 — Sistema de armas (espada, arco, vara)

- Estado: Borrador
- Requisito: trío de armas con drops de sus dueños. Espada buffeada (daño 2);
  arco dispara flechas hacia el apuntado, daño 1, cadencia 250 ms; vara intermedio
  (golpe 1) y mantener X 4 s lanza rayo de hielo (daño 3 + congelar 2 s, el
  jugador titila cargando y sale círculo azul). Recoger con C reemplaza el arma;
  la espada además cura medio corazón. Amarillo→espada, celeste→arco,
  azul→vara, siempre.
- Alcance: `src/combat/` (arsenal, vara, rayo, proyectil), `Player` (equipar y
  carga), `Enemy` (congelar, drops), IAs (respetar congelado), escena (drops),
  HUD (arma equipada).
- Aceptación: matar dueños suelta su arma; C la equipa; arco dispara rápido;
  4 s de X lanzan el rayo que congela; espada mata rojos de 1 golpe.
- Commit: pendiente
