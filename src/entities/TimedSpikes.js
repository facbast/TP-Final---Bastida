import Phaser from 'phaser';

// Pinchos temporizados: ocultos (marca tenue) → aviso parpadeante 0,8 s →
// activos 1 s en ciclo de ~4 s. Solo dañan en estado activo.
// El cuerpo físico lo lleva un rectángulo invisible posicionado.
// Decisiones de usuario del paso 7 (no son reglas del GDD).
const HIDDEN_TIME = 2400;
const WARN_TIME = 800;
const ACTIVE_TIME = 1000;
const SPIKE = 0x9aa0b0;
const SIZE = 120;

export class TimedSpikes extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y) {
    super(scene, x, y, SIZE, SIZE);
    this.setVisible(false);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.home = { x, y };
    this.state = 'hidden';
    this.armed = false;
    this.hurtsEnemies = true;
    this.until = scene.time.now + Math.random() * HIDDEN_TIME;
    this.view = scene.add.graphics();
    this.drawHidden();
  }

  drawHidden() {
    this.view.clear();
    this.view.lineStyle(2, SPIKE, 0.3);
    this.view.strokeCircle(this.home.x, this.home.y, 56);
  }

  drawSpikes(alpha) {
    const { x, y } = this.home;
    this.view.clear();
    this.view.fillStyle(SPIKE, alpha);
    this.view.fillRect(x - 60, y + 30, 120, 14);
    for (let i = 0; i < 4; i += 1) {
      const bx = x - 52 + i * 30;
      this.view.fillTriangle(bx, y + 32, bx + 24, y + 32, bx + 12, y - 28);
    }
  }

  update(time) {
    if (time < this.until) {
      if (this.state === 'warn') {
        this.drawSpikes(0.3 + 0.5 * Math.abs(Math.sin(time / 90)));
      }
      return;
    }
    if (this.state === 'hidden') {
      this.state = 'warn';
      this.until = time + WARN_TIME;
    } else if (this.state === 'warn') {
      this.state = 'active';
      this.armed = true;
      this.until = time + ACTIVE_TIME;
      this.drawSpikes(1);
    } else {
      this.state = 'hidden';
      this.armed = false;
      this.until = time + HIDDEN_TIME;
      this.drawHidden();
    }
  }
}
