import Phaser from 'phaser';
import { BasicChicken } from './BasicChicken.js';
import { OrbitSword } from './OrbitSword.js';

// Espadachín amarillo (GDD, NPCs, p. 2): se mueve como el rojo; cuando su
// espada apunta al jugador, anticipa 0,5 s (esquivable) y hace dash hacia él.
// Decisiones de usuario del paso 5b: vida 4, 30 pts + 3 exp, dash 700 px/s
// durante 250 ms, cooldown 3 s. El daño del dash usa el contacto base.
const WINDUP_TIME = 500;
const DASH_SPEED = 700;
const DASH_TIME = 250;
const DASH_COOLDOWN = 3000;

export class Swordsman extends BasicChicken {
  constructor(scene, x, y) {
    super(scene, x, y, { hp: 4, score: 30, color: 0xffdd22, size: 32 });
    this.sword = new OrbitSword(scene, this);
    this.attachments.push(this.sword);
    this.swordState = 'wander';
    this.dashAt = 0;
    this.dashUntil = 0;
    this.dashReadyAt = 0;
    this.dashDir = new Phaser.Math.Vector2(1, 0);
  }

  update(time, delta) {
    if (this.dead) return;
    if (this.isStaggered(time)) {
      this.body.setVelocity(this.knockVel.x, this.knockVel.y);
      this.sword.update(time, delta);
      return;
    }
    if (this.swordState === 'windup') {
      this.body.setVelocity(0, 0);
      this.setAlpha(0.4 + 0.6 * Math.abs(Math.sin(time / 80)));
      if (time >= this.dashAt) {
        const p = this.scene.player;
        this.dashDir.set(p.x - this.x, p.y - this.y).normalize();
        this.swordState = 'dash';
        this.dashUntil = time + DASH_TIME;
        this.setAlpha(1);
      }
    } else if (this.swordState === 'dash') {
      this.body.setVelocity(this.dashDir.x * DASH_SPEED, this.dashDir.y * DASH_SPEED);
      if (time >= this.dashUntil) {
        this.swordState = 'wander';
        this.dashReadyAt = time + DASH_COOLDOWN;
      }
    } else {
      super.update(time, delta);
      if (time >= this.dashReadyAt && this.sword.aimsAtPlayer()) {
        this.swordState = 'windup';
        this.dashAt = time + WINDUP_TIME;
        this.body.setVelocity(0, 0);
      }
    }
    this.sword.update(time, delta);
  }
}
