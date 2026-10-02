import { BasicChicken } from './BasicChicken.js';
import { ToxinPuddle } from './ToxinPuddle.js';

// Tóxico verde (GDD, NPCs, p. 2): como el rojo, gotea charcos de toxina.
// Decisiones de usuario del paso 5c: goteo cada 2,5 s, vida 3, 20 pts + 2 exp.
const DRIP_EVERY = 2500;

export class Toxic extends BasicChicken {
  constructor(scene, x, y) {
    super(scene, x, y, { hp: 3, score: 20, exp: 2, color: 0x33cc44, size: 32 });
    this.nextDrip = 0;
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.dead || this.isStaggered(time)) return;
    if (time >= this.nextDrip) {
      this.nextDrip = time + DRIP_EVERY;
      const puddle = new ToxinPuddle(this.scene, this.x, this.y);
      this.scene.hazards.add(puddle);
    }
  }
}
