import Phaser from 'phaser';
import { Enemy } from './Enemy.js';

// Pollo básico rojo (GDD, NPCs, p. 2): movimiento errático.
// Decisiones de usuario del paso 4: vida 2, 10 pts + 1 exp.
export class BasicChicken extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, { hp: 2, score: 10, exp: 1, color: 0xff0000, size: 30 });
    this.speed = 120;
    this.dir = new Phaser.Math.Vector2(1, 0);
    this.changeAt = 0;
    this.pickDirection();
  }

  pickDirection() {
    const angle = Math.random() * Math.PI * 2;
    this.dir.set(Math.cos(angle), Math.sin(angle));
  }

  update(time) {
    if (this.dead) return;
    this.body.setVelocity(this.dir.x * this.speed, this.dir.y * this.speed);
    if (time >= this.changeAt) {
      this.pickDirection();
      this.changeAt = time + 800 + Math.random() * 700;
    }
  }
}
