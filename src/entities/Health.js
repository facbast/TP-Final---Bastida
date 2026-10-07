// Salud en mitades de corazón (3 corazones = 6 mitades).
// Clase pura (sin Phaser) para poder probarla en Node.
// Decisiones de usuario del paso 2; no son reglas del GDD.
export class Health {
  constructor(maxHearts = 3) {
    this.maxHearts = maxHearts;
    this.maxHalves = maxHearts * 2;
    this.halves = this.maxHalves;
    this.listeners = new Set();
  }

  onChanged(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    for (const fn of this.listeners) fn(this);
  }

  hurt(amount = 1) {
    if (this.isEmpty()) return;
    this.halves = Math.max(0, this.halves - amount);
    this.emit();
  }

  heal(amount = 1) {
    if (this.isFull()) return;
    this.halves = Math.min(this.maxHalves, this.halves + amount);
    this.emit();
  }

  full() {
    if (this.isFull()) return;
    this.halves = this.maxHalves;
    this.emit();
  }

  raiseMax(hearts) {
    this.maxHearts += hearts;
    this.maxHalves += hearts * 2;
    this.halves = Math.min(this.halves, this.maxHalves);
    this.emit();
  }

  isEmpty() {
    return this.halves <= 0;
  }

  isFull() {
    return this.halves >= this.maxHalves;
  }

  // 'full' | 'half' | 'empty' para el corazón i-ésimo (0-based).
  stateOf(i) {
    const remaining = this.halves - i * 2;
    if (remaining >= 2) return 'full';
    if (remaining === 1) return 'half';
    return 'empty';
  }
}
