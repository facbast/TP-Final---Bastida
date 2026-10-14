// Récord persistente en el navegador (localStorage).
// Decisiones de usuario (no son reglas del GDD).
const TOP_KEY = 'rouge-egg:topScore';

export function getTopScore() {
  try {
    return Number(localStorage.getItem(TOP_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

// Devuelve true si es nuevo récord.
export function saveTopScore(score) {
  if (score <= getTopScore()) return false;
  try {
    localStorage.setItem(TOP_KEY, String(score));
  } catch {
    /* almacenamiento no disponible */
  }
  return true;
}
