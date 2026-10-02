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
    const cx = attacker.x + facing.x * this.range;
    const cy = attacker.y + facing.y * this.range;
    // Hitbox invisible + visual de espada larga del asset.
    const slash = s.add.rectangle(cx, cy, this.range, this.range, 0xffffff, 0);
    s.physics.add.existing(slash, true);
    const blade = s.add.image(cx, cy, 'weapon-longsword').setScale(0.5);
    blade.setRotation(Math.atan2(facing.y, facing.x) + Math.PI / 2);
    const hit = new Set();
    s.physics.add.overlap(slash, s.enemies, (zone, enemy) => {
      if (!hit.has(enemy)) {
        hit.add(enemy);
        enemy.takeDamage?.(this.damage);
      }
    });
    s.time.delayedCall(this.lifespan, () => {
      slash.destroy();
      blade.destroy();
    });
  }
}
