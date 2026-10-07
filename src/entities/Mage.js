import Phaser from 'phaser';
import { Enemy } from './Enemy.js';

// Mago helado azul (GDD, NPCs, p. 2): aura que ralentiza al acercarse y
// golpe de vara cuerpo a cuerpo (dibujo del asset con tinte azul).
// Decisiones de usuario del paso 5e (no son reglas del GDD):
// aura 250 px al 50%, acecho 60 px/s, vara 70 px / medio corazón / 1,5 s,
// vida 5, 40 pts + 4 exp.
const SLOW_RADIUS = 250;
const SLOW_FACTOR = 0.5;
const SLOW_REFRESH = 300;
const APPROACH_SPEED = 60;
const STAFF_RANGE = 70;
const STAFF_COOLDOWN = 1500;

export class Mage extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, { hp: 5, score: 40, color: 0x3388ff, size: 34 });
    this.nextStaff = 0;
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
    this.body.setVelocity(toPlayer.x * APPROACH_SPEED, toPlayer.y * APPROACH_SPEED);
    if (dist < SLOW_RADIUS) {
      p.applySlow?.(SLOW_FACTOR, SLOW_REFRESH);
    }
    if (dist < STAFF_RANGE && time >= this.nextStaff) {
      this.nextStaff = time + STAFF_COOLDOWN;
      this.swingStaff(toPlayer);
      p.takeHit(1);
    }
  }

  swingStaff(dir) {
    const s = this.scene;
    const staff = s.add.image(this.x, this.y, 'weapon-staff').setScale(0.5);
    staff.setTint(0x3388ff);
    const base = Math.atan2(dir.y, dir.x);
    const swing = { t: 0 };
    s.tweens.add({
      targets: swing,
      t: 1,
      duration: 200,
      onUpdate: () => {
        const a = base - 0.7 + swing.t * 1.4;
        staff.setPosition(this.x + Math.cos(a) * 40, this.y + Math.sin(a) * 40);
        staff.setRotation(a + Math.PI / 2);
      },
      onComplete: () => staff.destroy(),
    });
  }
}
