import Phaser from 'phaser';
import { Weapon } from './Weapon.js';
import { Projectile } from './Projectile.js';

// Arma a distancia: dispara un proyectil en la dirección de apuntado.
// Automática mientras X se mantiene (cadencia rápida, Spec 0003).
// La velocidad supera a la del jugador para que no queden pegadas al cuerpo.
export class RangedWeapon extends Weapon {
  constructor(scene, opts = {}) {
    super(scene, { damage: 1, cooldown: 400, ...opts });
    this.projectileSpeed = opts.projectileSpeed ?? 650;
    this.autoFire = true;
  }

  attack(attacker, facing, time) {
    if (!this.canAttack(time)) return;
    this.markAttack(time);
    new Projectile(
      this.scene,
      attacker.x + facing.x * 20,
      attacker.y + facing.y * 20,
      facing,
      this.projectileSpeed,
      this.damage,
    );
  }
}
