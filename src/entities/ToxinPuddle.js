import Phaser from 'phaser';

// Charco de toxina: zona estática con vida útil. Daña por contacto usando el
// takeHit del jugador (los iframes globales lo limitan a ~1 golpe por segundo).
// Sin efecto residual: fuera del charco no hay más daño.
// Decisiones de usuario del paso 5c: 60 px de radio, 6 s de duración.
const PUDDLE_RADIUS = 60;
const PUDDLE_LIFE = 6000;

export class ToxinPuddle extends Phaser.GameObjects.Ellipse {
  constructor(scene, x, y) {
    super(scene, x, y, PUDDLE_RADIUS * 2, PUDDLE_RADIUS * 2, 0x33cc44, 0.55);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    scene.tweens.add({
      targets: this,
      alpha: 0.15,
      duration: PUDDLE_LIFE,
      onComplete: () => this.destroy(),
    });
  }
}
