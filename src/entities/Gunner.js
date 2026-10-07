import Phaser from 'phaser';
import { Enemy } from './Enemy.js';
import { EnemyBullet } from './EnemyBullet.js';

// Pistolero celeste (GDD, NPCs, p. 2): mantiene distancia y dispara con
// cooldown. Sus balas se devuelven con el barrido del jugador.
// Decisiones de usuario del paso 5d (no son reglas del GDD):
// sostiene ~350 px, dispara hasta 450 px, cooldown 2 s,
// vida 3, 25 pts + 2 exp.
const HOLD_DIST = 350;
const APPROACH_ABOVE = 400;
const RETREAT_BELOW = 300;
const FIRE_RANGE = 450;
const MOVE_SPEED = 140;
const STRAFE_SPEED = 90;
const FIRE_COOLDOWN = 2000;

export class Gunner extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, { hp: 3, score: 25, color: 0x44ccff, size: 30 });
    // Arco del asset: apunta siempre al jugador (indicador de puntería).
    this.bow = scene.add.image(x, y, 'weapon-bow').setScale(0.35);
    this.attachments.push(this.bow);
    this.nextShot = 0;
    this.strafeDir = 1;
    this.strafeAt = 0;
  }

  update(time) {
    if (this.dead) return;
    if (this.isStaggered(time)) {
      this.body.setVelocity(this.knockVel.x, this.knockVel.y);
      return;
    }
    const p = this.scene.player;
    const toPlayer = new Phaser.Math.Vector2(p.x - this.x, p.y - this.y);
    const dist = toPlayer.length();
    toPlayer.normalize();
    this.bow.setPosition(this.x, this.y);
    this.bow.setRotation(Math.atan2(toPlayer.y, toPlayer.x) + Math.PI / 2);
    if (dist > APPROACH_ABOVE) {
      this.body.setVelocity(toPlayer.x * MOVE_SPEED, toPlayer.y * MOVE_SPEED);
    } else if (dist < RETREAT_BELOW) {
      this.body.setVelocity(-toPlayer.x * MOVE_SPEED, -toPlayer.y * MOVE_SPEED);
    } else {
      if (time >= this.strafeAt) {
        this.strafeDir *= -1;
        this.strafeAt = time + 2000;
      }
      this.body.setVelocity(
        -toPlayer.y * this.strafeDir * STRAFE_SPEED,
        toPlayer.x * this.strafeDir * STRAFE_SPEED,
      );
    }
    if (time >= this.nextShot && dist < FIRE_RANGE) {
      this.nextShot = time + FIRE_COOLDOWN;
      new EnemyBullet(this.scene, this.x, this.y, toPlayer.clone());
    }
  }
}
