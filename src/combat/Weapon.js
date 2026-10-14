// Estrategia base de arma (patrón Strategy): cada arma define cómo atacar.
// chargeTime > 0: mantener el ataque carga un disparo especial.
// autoFire: dispara sola mientras el ataque se mantiene.
export class Weapon {
  constructor(scene, { damage = 1, cooldown = 400 } = {}) {
    this.scene = scene;
    this.damage = damage;
    this.cooldown = cooldown;
    this.chargeTime = 0;
    this.autoFire = false;
    this.lastAttack = -Infinity;
  }

  canAttack(time) {
    return time - this.lastAttack >= this.cooldown;
  }

  markAttack(time) {
    this.lastAttack = time;
  }

  attack(attacker, facing, time) {
    throw new Error('Weapon.attack debe implementarse en la subclase');
  }

  releaseCharge() {}
}
