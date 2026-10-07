import Phaser from 'phaser';

// Cofre del tesoro: rombo dorado que se recoge automáticamente al contacto.
// Decisiones de usuario del paso 6 (no son reglas del GDD): 25 pts.
export class Treasure extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, value = 25) {
    super(scene, x, y, 36, 36, 0xffd75e);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setRotation(Math.PI / 4);
    this.value = value;
    scene.pickups.add(this);
  }
}
