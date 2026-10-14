import Phaser from 'phaser';

// Rayo de hielo de la vara: círculo azul grande que al contactar explota en
// área (daño + congelado) con onda expansiva que se desvanece.
// Decisiones de usuario (Spec 0003 + ajuste): daño 3, congelar 2 s, radio 130.
const BEAM_SPEED = 700;
const BEAM_LIFE = 1000;
const FREEZE_TIME = 2000;
const BLAST_RADIUS = 200;

export class IceBeam extends Phaser.GameObjects.Arc {
  constructor(scene, x, y, facing, damage = 3) {
    super(scene, x, y, 22, 0, 360, false, 0x66ccff, 0.9);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setVelocity(facing.x * BEAM_SPEED, facing.y * BEAM_SPEED);
    this.damage = damage;
    this.exploded = false;
    scene.physics.add.overlap(this, scene.enemies, () => this.explode());
    if (scene.walls) {
      scene.physics.add.collider(this, scene.walls, () => this.explode());
    }
    scene.time.delayedCall(BEAM_LIFE, () => {
      if (this.active && !this.exploded) this.destroy();
    });
  }

  explode() {
    if (this.exploded || !this.active) return;
    this.exploded = true;
    const s = this.scene;
    for (const enemy of s.enemies.getChildren()) {
      if (enemy.dead) continue;
      if (Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= BLAST_RADIUS) {
        enemy.takeDamage?.(this.damage);
        if (enemy.active) enemy.freeze?.(FREEZE_TIME);
      }
    }
    const wave = s.add.circle(this.x, this.y, 20, 0x66ccff, 0.6);
    const blast = { t: 0 };
    s.tweens.add({
      targets: blast,
      t: 1,
      duration: 500,
      onUpdate: () => {
        wave.setRadius(20 + blast.t * (BLAST_RADIUS - 20));
        wave.setAlpha(0.6 * (1 - blast.t));
      },
      onComplete: () => wave.destroy(),
    });
    this.destroy();
  }
}
