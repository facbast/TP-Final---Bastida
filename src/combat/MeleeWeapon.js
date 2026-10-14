import Phaser from 'phaser';
import { Weapon } from './Weapon.js';

// Arma cuerpo a cuerpo: barrido en arco ("limpiaparabrisas") con el dibujo.
// La hoja barre ±75° alrededor de la dirección de apuntado en 220 ms,
// con hitbox circular y rastro del arco.
// Decisiones de usuario (Spec 0003): espada daño 2 cadencia 400 ms.
const SWEEP = Phaser.Math.DegToRad(75);

export class MeleeWeapon extends Weapon {
  constructor(scene, opts = {}) {
    super(scene, { damage: 2, cooldown: 400, ...opts });
    this.blade = opts.blade ?? 'weapon-longsword';
    this.range = opts.range ?? 95;
    this.duration = opts.duration ?? 220;
  }

  attack(attacker, facing, time) {
    if (!this.canAttack(time)) return;
    this.markAttack(time);
    const s = this.scene;
    const baseAngle = Math.atan2(facing.y, facing.x);

    const zone = s.add.circle(attacker.x, attacker.y, this.range, 0xffffff, 0);
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
    // El barrido devuelve las balas enemigas en dirección opuesta.
    if (s.enemyBullets) {
      s.physics.add.overlap(zone, s.enemyBullets, (z, bullet) => {
        bullet.reflect?.();
      });
    }

    const arc = s.add.graphics();
    const blade = s.add.image(attacker.x, attacker.y, this.blade).setScale(0.55);
    const bladeDist = Math.max(40, this.range - 25);
    const drawArc = () => {
      arc.clear();
      arc.fillStyle(0xffffff, 0.15);
      arc.slice(attacker.x, attacker.y, this.range, baseAngle - SWEEP, baseAngle + SWEEP, false);
      arc.fillPath();
    };
    const placeBlade = (t) => {
      const a = baseAngle - SWEEP + t * 2 * SWEEP;
      blade.setPosition(
        attacker.x + Math.cos(a) * bladeDist,
        attacker.y + Math.sin(a) * bladeDist,
      );
      blade.setRotation(a + Math.PI / 2);
    };
    // Posición inicial inmediata: evita un cuadro de la hoja sobre el jugador.
    drawArc();
    placeBlade(0);

    const swing = { t: 0 };
    s.tweens.add({
      targets: swing,
      t: 1,
      duration: this.duration,
      onUpdate: () => {
        // El barrido sigue al jugador (ya no se queda atascado en dash).
        zone.body.reset(attacker.x, attacker.y);
        drawArc();
        placeBlade(swing.t);
      },
      onComplete: () => {
        zone.destroy();
        arc.destroy();
        blade.destroy();
      },
    });
  }
}
