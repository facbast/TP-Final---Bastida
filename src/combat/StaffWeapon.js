import { MeleeWeapon } from './MeleeWeapon.js';
import { IceBeam } from './IceBeam.js';

// Vara (Spec 0003): golpe intermedio con el báculo y, al mantener X 4 s,
// rayo de hielo que daña y congela.
export class StaffWeapon extends MeleeWeapon {
  constructor(scene) {
    super(scene, { damage: 1, blade: 'weapon-staff', range: 70, duration: 200 });
    this.chargeTime = 4000;
  }

  releaseCharge(attacker, facing) {
    new IceBeam(this.scene, attacker.x, attacker.y, facing);
  }
}
