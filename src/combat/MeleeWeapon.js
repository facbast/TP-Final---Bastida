import Phaser from 'phaser';
import { Weapon } from './Weapon.js';

// Arma cuerpo a cuerpo: barrido en arco ("limpiaparabrisas") con la espada.
// La hoja barre ±75° alrededor de la dirección de apuntado en 220 ms,
// con hitbox circular de radio 95 y rastro del arco.
// Decisiones de usuario (no son reglas del GDD): daño 1, cadencia 400 ms.
const ARC_RADIUS = 95;
const BLADE_DIST = 70;
const SWEEP = Phaser.Math.DegToRad(75);
const SWING_TIME = 220;

export class MeleeWeapon extends Weapon {
  constructor(scene, opts = {}) {
    super(scene, { damage: 1, cooldown: 400, ...opts });
  }

  attack(attacker, facing, time) {
    if (!this.canAttack(time)) return;
    this.markAttack(time);
    const s = this.scene;
    const baseAngle = Math.atan2(facing.y, facing.x);

    const zone = s.add.circle(attacker.x, attacker.y, ARC_RADIUS, 0xffffff, 0);
    s.physics.add.existing(zone);
    zone.body.setImmovable(true);
    const hit = new Set();
    s.physics.add.overlap(zone, s.enemies, (z, enemy) => {
      if (!hit.has(enemy)) {
        hit.add(enemy);
        enemy.takeDamage?.(this.damage);
        if (enemy.active) enemy.applyKnockback?.(attacker.x, attacker.y);
      }
    });

    const arc = s.add.graphics();
    const blade = s.add.image(attacker.x, attacker.y, 'weapon-longsword').setScale(0.55);
    const drawArc = () => {
      arc.clear();
      arc.fillStyle(0xffffff, 0.15);
      arc.slice(attacker.x, attacker.y, ARC_RADIUS, baseAngle - SWEEP, baseAngle + SWEEP, false);
      arc.fillPath();
    };

    const swing = { t: 0 };
    s.tweens.add({
      targets: swing,
      t: 1,
      duration: SWING_TIME,
      onUpdate: () => {
        // El barrido sigue al jugador (ya no se queda atascado en dash).
        zone.body.reset(attacker.x, attacker.y);
        drawArc();
        const a = baseAngle - SWEEP + swing.t * 2 * SWEEP;
        blade.setPosition(
          attacker.x + Math.cos(a) * BLADE_DIST,
          attacker.y + Math.sin(a) * BLADE_DIST,
        );
        blade.setRotation(a + Math.PI / 2);
      },
      onComplete: () => {
        zone.destroy();
        arc.destroy();
        blade.destroy();
      },
    });
  }
}
