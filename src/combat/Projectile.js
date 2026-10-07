import Phaser from 'phaser';

// Proyectil con dibujo de flecha del asset (apunta según su dirección).
export class Projectile extends Phaser.GameObjects.Image {
  constructor(scene, x, y, facing, speed, damage, lifespan = 900) {
    super(scene, x, y, 'weapon-arrow');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.35);
    this.setRotation(Math.atan2(facing.y, facing.x) + Math.PI / 2);
    this.damage = damage;
    this.body.setVelocity(facing.x * speed, facing.y * speed);
    scene.physics.add.overlap(this, scene.enemies, (proj, enemy) => {
      enemy.takeDamage?.(this.damage);
      proj.destroy();
    });
    if (scene.walls) {
      scene.physics.add.collider(this, scene.walls, (proj) => proj.destroy());
    }
    scene.time.delayedCall(lifespan, () => {
      if (this.active) this.destroy();
    });
  }
}
