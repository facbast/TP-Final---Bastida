// Estrategia base de arma (patrón Strategy): cada arma define cómo atacar.
// Daño base 1 y cadencia 400 ms (decisión de usuario, paso 1; no es regla del GDD).
export class Weapon {
  constructor(scene, { damage = 1, cooldown = 400 } = {}) {
    this.scene = scene;
    this.damage = damage;
    this.cooldown = cooldown;
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
}
