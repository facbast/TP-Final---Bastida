import Phaser from 'phaser';

// Pantalla de título: nombre, controles e inicio (paso 10).
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);
    const cx = 640;
    this.add
      .text(cx, 220, 'ROUGE EGG', {
        fontFamily: 'monospace',
        fontSize: '72px',
        color: '#ffd75e',
      })
      .setOrigin(0.5);
    this.add
      .text(cx, 290, 'Infiltra la guarida de los pollos mutantes', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    const controls = [
      'Flechas: moverse (Este = derecha)',
      'Z: dash (mantené para más distancia)   X: ataque   C: interactuar',
      '1/2/3: elegir bonificación al subir de nivel',
    ];
    controls.forEach((line, i) => {
      this.add
        .text(cx, 370 + i * 32, line, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#9aa0b0',
        })
        .setOrigin(0.5);
    });
    const start = this.add
      .text(cx, 520, 'Pulsa ENTER para empezar', {
        fontFamily: 'monospace',
        fontSize: '26px',
        color: '#33ff88',
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: start,
      alpha: 0.35,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
    this.input.keyboard.on('keydown-ENTER', () => this.begin());
    this.input.on('pointerdown', () => this.begin());
  }

  begin() {
    const cam = this.cameras.main;
    cam.fadeOut(250, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
  }
}
