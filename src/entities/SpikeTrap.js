import Phaser from 'phaser';

// Pinchos fijos: triángulos grises siempre activos, medio corazón por golpe.
// El cuerpo físico lo lleva un rectángulo invisible posicionado (los Graphics
// dibujan en coordenadas absolutas pero su objeto vive en 0,0).
// Decisiones de usuario del paso 7 (no son reglas del GDD).
const SPIKE = 0x9aa0b0;
const SIZE = 120;

export class SpikeTrap extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y) {
    super(scene, x, y, SIZE, SIZE);
    this.setVisible(false);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.armed = true;
    this.hurtsEnemies = true;
    const g = scene.add.graphics();
    g.fillStyle(SPIKE, 1);
    g.fillRect(x - 60, y + 30, 120, 14);
    for (let i = 0; i < 4; i += 1) {
      const bx = x - 52 + i * 30;
      g.fillTriangle(bx, y + 32, bx + 24, y + 32, bx + 12, y - 28);
    }
  }
}
