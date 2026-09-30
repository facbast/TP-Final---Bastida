import Phaser from 'phaser';
import { Weapon } from './Weapon.js';
import { Projectile } from './Projectile.js';

// Arma a distancia: dispara un proyectil en la dirección de apuntado.
export class RangedWeapon extends Weapon {
  constructor(scene, opts = {}) {
    super(scene, { damage: 1, cooldown: 400, ...opts });
    this.projectileSpeed = opts.projectileSpeed ?? 400;
  }

  attack(attacker, facing, time) {
    if (!this.canAttack(time)) return;
    this.markAttack(time);
    new Projectile(
      this.scene,
      attacker.x,
      attacker.y,
      facing,
      this.projectileSpeed,
      this.damage,
    );
  }
}
