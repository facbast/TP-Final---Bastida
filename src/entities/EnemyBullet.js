import Phaser from 'phaser';

// Bala enemiga: daña al jugador al contacto. Si el barrido del jugador la
// alcanza, se refleja (invierte su dirección, cambia a celeste) y pasa a
// dañar enemigos. Muere contra muros o por tiempo.
// Decisiones de usuario del paso 5d: 350 px/s, medio corazón.
const BULLET_SPEED = 350;
const BULLET_LIFE = 2500;

export class EnemyBullet extends Phaser.GameObjects.Arc {
  constructor(scene, x, y, dir) {
    super(scene, x, y, 8, 0, 360, false, 0xff4422, 1);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setVelocity(dir.x * BULLET_SPEED, dir.y * BULLET_SPEED);
    this.reflected = false;
    scene.enemyBullets.add(this);
    scene.time.delayedCall(BULLET_LIFE, () => this.destroy());
  }

  reflect() {
    if (this.reflected || !this.active) return;
    this.reflected = true;
    this.body.setVelocity(-this.body.velocity.x, -this.body.velocity.y);
    this.setFillStyle(0x44ccff);
  }
}
