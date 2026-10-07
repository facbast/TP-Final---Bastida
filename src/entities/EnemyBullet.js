import Phaser from 'phaser';

// Bala enemiga: flecha del asset con tinte celeste de clase. Daña al jugador.
// Si el barrido la alcanza, se refleja (blanca, dirección opuesta) y pasa a
// dañar enemigos. Muere contra muros o por tiempo.
// Decisiones de usuario (paso 5d + assets): 350 px/s, medio corazón.
const BULLET_SPEED = 350;
const BULLET_LIFE = 2500;

export class EnemyBullet extends Phaser.GameObjects.Image {
  constructor(scene, x, y, dir) {
    super(scene, x, y, 'weapon-arrow');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.enemyBullets.add(this);
    this.setScale(0.35);
    this.setRotation(Math.atan2(dir.y, dir.x) + Math.PI / 2);
    this.setTint(0x44ccff);
    this.reflected = false;
    this.body.setVelocity(dir.x * BULLET_SPEED, dir.y * BULLET_SPEED);
    scene.time.delayedCall(BULLET_LIFE, () => {
      if (this.active) this.destroy();
    });
  }

  reflect() {
    if (this.reflected || !this.active) return;
    this.reflected = true;
    this.body.setVelocity(-this.body.velocity.x, -this.body.velocity.y);
    this.clearTint();
  }
}
