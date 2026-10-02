import Phaser from 'phaser';
import { Enemy } from './Enemy.js';

// Perseguidor naranja (GDD, NPCs, p. 2): vaga lento, persigue en su área,
// se cansa y duerme, retoma si el jugador se acerca.
// Decisiones de usuario del paso 5a (no son reglas del GDD):
// vagar 80 px/s, detección 300 px, persecución 160 px/s durante 5 s,
// sueño hasta 4 s o jugador en 220 px, vida 3, 20 pts + 2 exp.
const WANDER_SPEED = 80;
const CHASE_SPEED = 160;
const DETECT_DIST = 300;
const CHASE_TIME = 5000;
const WAKE_DIST = 220;
const SLEEP_MAX = 4000;

export class Pursuer extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, { hp: 3, score: 20, exp: 2, color: 0xff8800, size: 34 });
    this.state = 'wander';
    this.dir = new Phaser.Math.Vector2(1, 0);
    this.changeAt = 0;
    this.chaseUntil = 0;
    this.sleepUntil = 0;
    this.pickDirection();
  }

  pickDirection() {
    const angle = Math.random() * Math.PI * 2;
    this.dir.set(Math.cos(angle), Math.sin(angle));
  }

  playerDist() {
    const p = this.scene.player;
    return Phaser.Math.Distance.Between(this.x, this.y, p.x, p.y);
  }

  update(time) {
    if (this.dead) return;
    if (this.isStaggered(time)) {
      this.body.setVelocity(this.knockVel.x, this.knockVel.y);
      return;
    }
    const dist = this.playerDist();
    if (this.state === 'wander') {
      if (dist < DETECT_DIST) {
        this.state = 'chase';
        this.chaseUntil = time + CHASE_TIME;
      } else {
        if (time >= this.changeAt) {
          this.pickDirection();
          this.changeAt = time + 800 + Math.random() * 700;
        }
        this.body.setVelocity(this.dir.x * WANDER_SPEED, this.dir.y * WANDER_SPEED);
      }
    }
    if (this.state === 'chase') {
      if (time >= this.chaseUntil) {
        this.state = 'sleep';
        this.sleepUntil = time + SLEEP_MAX;
        this.body.setVelocity(0, 0);
        this.setAlpha(0.55);
      } else {
        const p = this.scene.player;
        const chase = new Phaser.Math.Vector2(p.x - this.x, p.y - this.y).normalize();
        this.body.setVelocity(chase.x * CHASE_SPEED, chase.y * CHASE_SPEED);
      }
    }
    if (this.state === 'sleep') {
      if (dist < WAKE_DIST) {
        this.wake(dist < DETECT_DIST ? 'chase' : 'wander', time);
      } else if (time >= this.sleepUntil) {
        this.wake('wander', time);
      }
    }
  }

  wake(next, time) {
    this.state = next;
    this.setAlpha(1);
    if (next === 'chase') this.chaseUntil = time + CHASE_TIME;
    else this.changeAt = time;
  }
}
