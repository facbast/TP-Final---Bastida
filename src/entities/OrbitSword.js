import Phaser from 'phaser';

// Espada orbital del espadachín: dibujo del asset con tinte amarillo de clase.
// Detecta cuándo apunta al jugador (disparador del dash). Visual, sin daño.
// Decisiones de usuario (no son reglas del GDD): órbita 60 px / 4 s por vuelta,
// apuntado ±15° a 350 px.
const ORBIT_RADIUS = 60;
const ORBIT_PERIOD = 6000;
const AIM_TOLERANCE = Phaser.Math.DegToRad(15);
const AIM_RANGE = 350;

export class OrbitSword extends Phaser.GameObjects.Image {
  constructor(scene, owner) {
    super(scene, owner.x + ORBIT_RADIUS, owner.y, 'weapon-longsword');
    scene.add.existing(this);
    this.setScale(0.5);
    this.setTint(0xffdd22);
    this.owner = owner;
    this.angle = 0;
  }

  update(time, delta) {
    if (!this.owner.active) {
      this.destroy();
      return;
    }
    this.angle += ((Math.PI * 2) / ORBIT_PERIOD) * delta;
    this.setPosition(
      this.owner.x + Math.cos(this.angle) * ORBIT_RADIUS,
      this.owner.y + Math.sin(this.angle) * ORBIT_RADIUS,
    );
    // El dibujo apunta hacia arriba: rotar para que el filo mire hacia afuera.
    this.setRotation(this.angle + Math.PI / 2);
  }

  aimsAtPlayer() {
    const p = this.scene.player;
    const dx = p.x - this.owner.x;
    const dy = p.y - this.owner.y;
    if (Math.hypot(dx, dy) > AIM_RANGE) return false;
    const swordAngle = Math.atan2(this.y - this.owner.y, this.x - this.owner.x);
    return Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - swordAngle)) < AIM_TOLERANCE;
  }
}
