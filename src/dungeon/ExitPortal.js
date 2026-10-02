import Phaser from 'phaser';

// Salida del nivel: círculo que avanza al siguiente nivel con C.
export class ExitPortal extends Phaser.GameObjects.Arc {
  constructor(scene, x, y) {
    super(scene, x, y, 24, 0, 360, false, 0x33ff88, 0.8);
    scene.add.existing(this);
    this.interactRadius = 72;
    scene.tweens.add({
      targets: this,
      alpha: 0.35,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  interact() {
    this.scene.nextLevel();
  }
}
