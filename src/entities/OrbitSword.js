import Phaser from 'phaser';

// Espada orbital del espadachín: orbita, y si apunta al jugador realiza un
// ataque teledirigido que luego regresa a la órbita. Etérea (sin muros).
// Decisiones de usuario del paso 5b (no son reglas del GDD):
// órbita 60 px / 2 s por vuelta, apuntado ±15° a 350 px,
// vuelo 300 px/s con seguimiento 0,6 s, medio corazón, cooldown 3 s.
const ORBIT_RADIUS = 60;
const ORBIT_PERIOD = 2000;
const AIM_TOLERANCE = Phaser.Math.DegToRad(15);
const AIM_RANGE = 350;
const ATTACK_SPEED = 300;
const TRACK_TIME = 600;
const RETURN_SPEED = 380;
const COOLDOWN = 3000;

export class OrbitSword extends Phaser.GameObjects.Rectangle {
  constructor(scene, owner) {
    super(scene, owner.x + ORBIT_RADIUS, owner.y, 26, 8, 0xffffff);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.owner = owner;
    this.state = 'orbit';
    this.angle = 0;
    this.attackUntil = 0;
    this.readyAt = 0;
    scene.physics.add.overlap(this, scene.player, (sword, player) => {
      if (sword.state === 'attack') {
        player.takeHit(1);
        sword.startReturn();
      }
    });
  }

  orbitSlot() {
    return {
      x: this.owner.x + Math.cos(this.angle) * ORBIT_RADIUS,
      y: this.owner.y + Math.sin(this.angle) * ORBIT_RADIUS,
    };
  }

  update(time, delta) {
    if (!this.owner.active) {
      this.destroy();
      return;
    }
    if (this.state === 'orbit') {
      this.angle += ((Math.PI * 2) / ORBIT_PERIOD) * delta;
      const slot = this.orbitSlot();
      this.body.reset(slot.x, slot.y);
      this.setRotation(this.angle);
      if (time >= this.readyAt && this.aimsAtPlayer()) {
        this.state = 'attack';
        this.attackUntil = time + TRACK_TIME;
      }
    } else if (this.state === 'attack') {
      const p = this.scene.player;
      const dir = new Phaser.Math.Vector2(p.x - this.x, p.y - this.y).normalize();
      this.body.setVelocity(dir.x * ATTACK_SPEED, dir.y * ATTACK_SPEED);
      this.setRotation(Math.atan2(dir.y, dir.x));
      if (time >= this.attackUntil) this.startReturn();
    } else {
      const slot = this.orbitSlot();
      const dir = new Phaser.Math.Vector2(slot.x - this.x, slot.y - this.y);
      if (dir.length() < 14) {
        this.state = 'orbit';
        this.readyAt = time + COOLDOWN;
        this.body.setVelocity(0, 0);
      } else {
        dir.normalize();
        this.body.setVelocity(dir.x * RETURN_SPEED, dir.y * RETURN_SPEED);
      }
    }
  }

  aimsAtPlayer() {
    const p = this.scene.player;
    const toPlayer = new Phaser.Math.Vector2(p.x - this.owner.x, p.y - this.owner.y);
    if (toPlayer.length() > AIM_RANGE) return false;
    const a = Phaser.Math.Angle.Wrap(
      Math.atan2(toPlayer.y, toPlayer.x) - Math.atan2(this.y - this.owner.y, this.x - this.owner.x),
    );
    return Math.abs(a) < AIM_TOLERANCE;
  }

  startReturn() {
    if (this.state !== 'attack') return;
    this.state = 'return';
  }
}
