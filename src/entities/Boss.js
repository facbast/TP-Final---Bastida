import Phaser from 'phaser';
import { Enemy } from './Enemy.js';

// Jefe: Pollo Morado (GDD, NPCs, p. 2, con divergencia a nivel 10).
// Grande, vaga lento y cada ~3,5 s anticipa 0,6 s y dashea hacia el jugador.
// El dash quita 2 corazones; el contacto, medio. Inmune al aturdido por peso.
// Decisiones de usuario del paso 9 (no son reglas del GDD):
// vida 20, 500 pts.
const WANDER_SPEED = 50;
const DASH_SPEED = 800;
const DASH_TIME = 300;
const WINDUP_TIME = 600;
const DASH_COOLDOWN = 3500;

export class Boss extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, { hp: 20, score: 500, color: 0x9933cc, size: 64 });
    this.fightState = 'wander';
    this.dir = new Phaser.Math.Vector2(1, 0);
    this.changeAt = 0;
    this.dashAt = 0;
    this.dashUntil = 0;
    this.dashReadyAt = 0;
    this.dashDir = new Phaser.Math.Vector2(1, 0);
    this.pickDirection();
  }

  pickDirection() {
    const angle = Math.random() * Math.PI * 2;
    this.dir.set(Math.cos(angle), Math.sin(angle));
  }

  applyKnockback() {
    // Demasiado pesado para aturdirse: el daño igual entra.
  }

  onDeath() {
    this.scene.onBossDefeated(this.x, this.y);
  }

  update(time, delta) {
    if (this.dead) return;
    this.contactDamage = this.fightState === 'dash' ? 4 : 1;
    if (this.fightState === 'windup') {
      this.body.setVelocity(0, 0);
      this.setAlpha(0.4 + 0.6 * Math.abs(Math.sin(time / 80)));
      if (time >= this.dashAt) {
        const p = this.scene.player;
        this.dashDir.set(p.x - this.x, p.y - this.y).normalize();
        this.fightState = 'dash';
        this.dashUntil = time + DASH_TIME;
        this.setAlpha(1);
      }
    } else if (this.fightState === 'dash') {
      this.body.setVelocity(this.dashDir.x * DASH_SPEED, this.dashDir.y * DASH_SPEED);
      if (time >= this.dashUntil) {
        this.fightState = 'wander';
        this.dashReadyAt = time + DASH_COOLDOWN;
        this.changeAt = time;
      }
    } else {
      if (time >= this.changeAt) {
        this.pickDirection();
        this.changeAt = time + 1200 + Math.random() * 800;
      }
      this.body.setVelocity(this.dir.x * WANDER_SPEED, this.dir.y * WANDER_SPEED);
      const p = this.scene.player;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, p.x, p.y);
      if (dist < 600 && time >= this.dashReadyAt) {
        this.fightState = 'windup';
        this.dashAt = time + WINDUP_TIME;
        this.body.setVelocity(0, 0);
      }
    }
  }
}
