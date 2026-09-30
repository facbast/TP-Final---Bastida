import Phaser from 'phaser';
import { Weapon } from './Weapon.js';

// Arma cuerpo a cuerpo: golpe frontal de corto alcance (tecla X con arma melee).
export class MeleeWeapon extends Weapon {
  constructor(scene, opts = {}) {
    super(scene, { damage: 1, cooldown: 400, ...opts });
    this.range = opts.range ?? 48;
    this.lifespan = opts.lifespan ?? 120;
  }

  attack(attacker, facing, time) {
    if (!this.canAttack(time)) return;
    this.markAttack(time);
    const s = this.scene;
    const slash = s.add.rectangle(
      attacker.x + facing.x * this.range,
      attacker.y + facing.y * this.range,
      this.range,
      this.range,
      0xffffff,
      0.5,
    );
    s.physics.add.existing(slash, true);
    const hit = new Set();
    s.physics.add.overlap(slash, s.enemies, (zone, enemy) => {
      if (!hit.has(enemy)) {
        hit.add(enemy);
        enemy.takeDamage?.(this.damage);
      }
    });
    s.time.delayedCall(this.lifespan, () => slash.destroy());
  }
}
