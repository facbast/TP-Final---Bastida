import Phaser from 'phaser';

// Pinchos fijos: triángulos grises siempre activos, medio corazón por golpe.
// Decisiones de usuario del paso 7 (no son reglas del GDD).
const SPIKE = 0x9aa0b0;

export class SpikeTrap extends Phaser.GameObjects.Graphics {
  constructor(scene, x, y) {
    super(scene);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.body.setSize(120, 120, true);
    this.armed = true;
    this.hurtsEnemies = true;
    this.fillStyle(SPIKE, 1);
    this.fillRect(x - 60, y + 30, 120, 14);
    for (let i = 0; i < 4; i += 1) {
      const bx = x - 52 + i * 30;
      this.fillTriangle(bx, y + 32, bx + 24, y + 32, bx + 12, y - 28);
    }
  }
}
