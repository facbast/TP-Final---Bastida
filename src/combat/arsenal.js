import { MeleeWeapon } from './MeleeWeapon.js';
import { RangedWeapon } from './RangedWeapon.js';
import { StaffWeapon } from './StaffWeapon.js';

// Arsenal del jugador (Spec 0003): espada buffeada, arco rápido, vara con rayo.
// Solo un arma equipada; recoger reemplaza.
export function createPlayerWeapon(scene, type) {
  switch (type) {
    case 'bow':
      return new RangedWeapon(scene, { damage: 1, cooldown: 250 });
    case 'staff':
      return new StaffWeapon(scene);
    case 'sword':
    default:
      return new MeleeWeapon(scene, { damage: 2 });
  }
}

export const WEAPON_NAMES = {
  sword: 'Espada',
  bow: 'Arco',
  staff: 'Vara',
};
