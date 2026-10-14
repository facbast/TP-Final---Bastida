import Phaser from 'phaser';

// Arma soltada por su dueño (amarillo→espada, celeste→arco, azul→vara).
// Se recoge con C y reemplaza la equipada; la espada cura medio corazón.
const ICONS = {
  sword: 'weapon-longsword',
  bow: 'weapon-bow-arrow',
  staff: 'weapon-staff',
};

export class WeaponPickup extends Phaser.GameObjects.Image {
  constructor(scene, x, y, weaponType) {
    super(scene, x, y, ICONS[weaponType] ?? ICONS.sword);
    scene.add.existing(this);
    this.setScale(0.5);
    this.weaponType = weaponType;
    this.interactRadius = 72;
    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  interact(player) {
    player.equipWeapon(this.weaponType);
    if (this.weaponType === 'sword') player.health.heal(1);
    player.scene.hud?.refresh();
    this.destroy();
  }
}
