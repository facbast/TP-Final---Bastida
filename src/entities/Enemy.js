import Phaser from 'phaser';

// Enemigo base: triángulo con vida; al morir otorga puntos y experiencia.
// El daño recibido llega vía takeDamage (armas del jugador, paso 1).
export class Enemy extends Phaser.GameObjects.Triangle {
  constructor(scene, x, y, { hp = 2, score = 10, exp = 1, color = 0xff0000, size = 30 } = {}) {
    super(scene, x, y, 0, size, size, size, size / 2, 0, color);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.baseColor = color;
    this.maxHp = hp;
    this.hp = hp;
    this.score = score;
    this.exp = exp;
    this.dead = false;
  }

  takeDamage(amount = 1) {
    if (this.dead) return;
    this.hp -= amount;
    this.setFillStyle(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (!this.dead) this.setFillStyle(this.baseColor);
    });
    if (this.hp <= 0) {
      this.dead = true;
      this.scene.onEnemyKilled(this);
      this.destroy();
    }
  }
}
