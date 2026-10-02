import { BasicChicken } from './BasicChicken.js';

// Crea enemigos por tipo (patrón Factory). Nuevas clases del paso 5
// se registran aquí sin tocar a los consumidores.
export function createEnemy(scene, type, x, y) {
  switch (type) {
    case 'basic':
      return new BasicChicken(scene, x, y);
    default:
      throw new Error(`Tipo de enemigo desconocido: ${type}`);
  }
}
