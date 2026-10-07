import Phaser from 'phaser';

// Salida del nivel: círculo que avanza al siguiente nivel con C.
// Con toVictory, cierra la partida en pantalla de victoria (jefe, paso 9).
export class ExitPortal extends Phaser.GameObjects.Arc {
  constructor(scene, x, y, { toVictory = false } = {}) {
    super(scene, x, y, 24, 0, 360, false, 0x33ff88, 0.8);
    scene.add.existing(this);
    this.toVictory = toVictory;
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
    if (this.toVictory) this.scene.onVictory();
    else this.scene.nextLevel();
  }
}
