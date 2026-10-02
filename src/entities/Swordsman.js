import { BasicChicken } from './BasicChicken.js';
import { OrbitSword } from './OrbitSword.js';

// Espadachín amarillo (GDD, NPCs, p. 2): se mueve como el rojo y suma una
// espada orbital con ataque teledirigido.
// Decisiones de usuario del paso 5b: vida 4, 30 pts + 3 exp.
export class Swordsman extends BasicChicken {
  constructor(scene, x, y) {
    super(scene, x, y, { hp: 4, score: 30, exp: 3, color: 0xffdd22, size: 32 });
    this.sword = new OrbitSword(scene, this);
  }

  update(time, delta) {
    super.update(time, delta);
    if (!this.dead) this.sword.update(time, delta);
  }
}
