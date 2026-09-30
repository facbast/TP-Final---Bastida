import Phaser from 'phaser';

// Proyectil geométrico: daña al primer enemigo alcanzado o muere contra muros.
export class Projectile extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, facing, speed, damage, lifespan = 900) {
    super(scene, x, y, 10, 10, 0xffff00);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.damage = damage;
    this.body.setVelocity(facing.x * speed, facing.y * speed);
    scene.physics.add.overlap(this, scene.enemies, (proj, enemy) => {
      enemy.takeDamage?.(this.damage);
      proj.destroy();
    });
    if (scene.walls) {
      scene.physics.add.collider(this, scene.walls, (proj) => proj.destroy());
    }
    scene.time.delayedCall(lifespan, () => this.destroy());
  }
}
