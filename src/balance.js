// Balance global (decisiones de usuario; difieren del GDD donde se indica).
// Divergencia del GDD (Objetivo, p. 2: "puntos y experiencia"): la experiencia
// se eliminó como moneda; todo otorga puntos y el jugador sube de nivel
// cada SCORE_NEXT puntos.
export const SCORE_NEXT = 200;

// Composición del nivel (paso 8): mismos tipos, cantidades progresivas.
// Nivel 1: 6 salas, 4/2/2/2/2/1 enemigos, 6+3 trampas.
export function compositionFor(level) {
  return {
    rooms: 5 + level,
    basic: 3 + level,
    pursuer: 1 + Math.ceil(level / 2),
    swordsman: 1 + Math.ceil(level / 2),
    toxic: 1 + Math.ceil(level / 2),
    gunner: 1 + Math.ceil(level / 2),
    mage: 1 + Math.floor(level / 4),
    spikes: 5 + level,
    timed: 2 + Math.ceil(level / 2),
  };
}
