import Phaser from 'phaser';

// Enemigo base: triángulo con vida; al morir otorga puntos y experiencia.
// El daño recibido llega vía takeDamage (armas del jugador, paso 1).
export class Enemy extends Phaser.GameObjects.Triangle {
  constructor(scene, x, y, { hp = 2, score = 10, color = 0xff0000, size = 30 } = {}) {
    super(scene, x, y, 0, size, size, size, size / 2, 0, color);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.baseColor = color;
    this.maxHp = hp;
    this.hp = hp;
    this.score = score;
    this.dead = false;
    this.attachments = [];
    this.knockVel = new Phaser.Math.Vector2(0, 0);
    this.knockUntil = 0;
    // Daño por contacto en mitades (base: medio corazón).
    this.contactDamage = 1;
    this.dropType = null;
    this.frozenUntil = 0;
  }

  isStaggered(time) {
    return time < this.knockUntil;
  }

  isFrozen(time) {
    return time < this.frozenUntil;
  }

  // Congelado: quieto con tinte helado hasta el vencimiento.
  // Los triángulos son Shapes (sin setTint): se usa fillStyle.
  freeze(duration = 2000) {
    this.frozenUntil = this.scene.time.now + duration;
    this.wasFrozen = true;
    this.setFillStyle(0x99eeff);
  }

  // Devuelve true si está congelado (detiene e ignora la IA).
  updateFrost(time) {
    if (!this.isFrozen(time)) {
      if (this.wasFrozen) {
        this.wasFrozen = false;
        this.setFillStyle(this.baseColor);
      }
      return false;
    }
    this.body.setVelocity(0, 0);
    return true;
  }

  // Empujón con aturdido breve: la IA no lo sobrescribe mientras dura.
  applyKnockback(fromX, fromY, speed = 380, duration = 180) {
    const dir = new Phaser.Math.Vector2(this.x - fromX, this.y - fromY);
    if (dir.lengthSq() === 0) dir.set(1, 0);
    dir.normalize();
    this.knockVel.copy(dir).scale(speed);
    this.knockUntil = this.scene.time.now + duration;
    this.body.setVelocity(this.knockVel.x, this.knockVel.y);
  }

  // award=false: muertes que no otorgan puntos (trampas).
  takeDamage(amount = 1, award = true) {
    if (this.dead) return;
    this.hp -= amount;
    this.setFillStyle(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (!this.dead) this.setFillStyle(this.baseColor);
    });
    if (this.hp <= 0) {
      this.dead = true;
      for (const attachment of this.attachments) attachment.destroy?.();
      this.onDeath();
      if (this.dropType) this.scene.dropWeapon?.(this.x, this.y, this.dropType);
      if (award) this.scene.onEnemyKilled(this);
      else this.destroy();
    }
  }

  // Gancho de muerte (el jefe lo usa para plantar el portal).
  onDeath() {}
}
