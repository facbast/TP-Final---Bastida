import { BasicChicken } from './BasicChicken.js';
import { Pursuer } from './Pursuer.js';
import { Swordsman } from './Swordsman.js';
import { Toxic } from './Toxic.js';
import { Gunner } from './Gunner.js';
import { Mage } from './Mage.js';
import { Boss } from './Boss.js';

// Crea enemigos por tipo (patrón Factory). Nuevas clases del paso 5
// se registran aquí sin tocar a los consumidores.
export function createEnemy(scene, type, x, y) {
  switch (type) {
    case 'basic':
      return new BasicChicken(scene, x, y);
    case 'pursuer':
      return new Pursuer(scene, x, y);
    case 'swordsman':
      return new Swordsman(scene, x, y);
    case 'toxic':
      return new Toxic(scene, x, y);
    case 'gunner':
      return new Gunner(scene, x, y);
    case 'mage':
      return new Mage(scene, x, y);
    case 'boss':
      return new Boss(scene, x, y);
    default:
      throw new Error(`Tipo de enemigo desconocido: ${type}`);
  }
}
