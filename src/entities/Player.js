import Phaser from 'phaser';
import { MeleeWeapon } from '../combat/MeleeWeapon.js';
import { Health } from './Health.js';

// Jugador: cuadrado azul (GDD, Controles del jugador, p. 2).
// Este = DERECHA, Oeste = IZQUIERDA, Norte = ARRIBA, Sur = ABAJO,
// Dash = Z (impulso con invulnerabilidad, cooldown 1 s),
// Ataque = X (delega en el arma equipada), Interactuar = C.
// Parámetros de dash/ataque: decisiones de usuario del paso 1.
const SPEED = 400;
// Daño base por contacto: medio corazón (decisión paso 2; rige hasta la
// tabla definitiva de enemigos del paso 4). Invulnerabilidad tras golpe: 1 s.
// Respawn: en posición de muerte, salud completa, invulnerable 2 s.
const HIT_IFRAMES = 1000;
const RESPAWN_IFRAMES = 2000;
const DASH_SPEED = 950;
const DASH_MIN_TIME = 180;
const DASH_MAX_TIME = 450;
const DASH_COOLDOWN = 1000;

export class Player extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, snapshot = {}) {
    super(scene, x, y, 32, 32, 0x0000ff);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);
    this.facing = new Phaser.Math.Vector2(0, 1);
    this.dashDir = this.facing.clone();
    this.moveDir = new Phaser.Math.Vector2(0, 0);
    this.health = new Health(3);
    this.lives = snapshot.lives ?? 3;
    if (snapshot.halves !== undefined) {
      this.health.halves = Phaser.Math.Clamp(
        snapshot.halves,
        0,
        this.health.maxHalves,
      );
    }
    this.weapon = new MeleeWeapon(scene);
    this.dashUntil = 0;
    this.dashMaxUntil = 0;
    this.dashReadyAt = 0;
    this.invulnerableUntil = 0;
    const kb = scene.input.keyboard;
    this.keys = {
      cursors: kb.createCursorKeys(),
      dash: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      attack: kb.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      interact: kb.addKey(Phaser.Input.Keyboard.KeyCodes.C),
    };
  }

  isDashing(time) {
    return time < this.dashUntil;
  }

  isInvulnerable(time) {
    return time < this.invulnerableUntil;
  }

  update(time) {
    const { cursors, dash, attack, interact } = this.keys;
    const dir = new Phaser.Math.Vector2(
      (cursors.right.isDown ? 1 : 0) - (cursors.left.isDown ? 1 : 0),
      (cursors.down.isDown ? 1 : 0) - (cursors.up.isDown ? 1 : 0),
    );
    if (dir.lengthSq() > 0) {
      dir.normalize();
      if (!this.isDashing(time)) this.facing.copy(dir);
    }
    this.moveDir.copy(dir);
    if (
      Phaser.Input.Keyboard.JustDown(dash) &&
      time >= this.dashReadyAt &&
      !this.isDashing(time)
    ) {
      this.dashDir.copy(this.facing);
      this.dashUntil = time + DASH_MIN_TIME;
      this.dashMaxUntil = time + DASH_MAX_TIME;
      this.dashReadyAt = time + DASH_COOLDOWN;
      this.invulnerableUntil = this.dashUntil;
    }
    if (this.isDashing(time)) {
      if (dash.isDown && time < this.dashMaxUntil) {
        // Mantener Z extiende el dash hasta el máximo.
        this.dashUntil = Math.min(time + 60, this.dashMaxUntil);
        this.invulnerableUntil = this.dashUntil;
      } else {
        this.dashUntil = Math.min(this.dashUntil, time);
      }
    }
    const move = this.isDashing(time) ? this.dashDir : dir;
    const speed = this.isDashing(time) ? DASH_SPEED : SPEED;
    this.body.setVelocity(move.x * speed, move.y * speed);
    this.setAlpha(this.isInvulnerable(time) ? 0.5 : 1);

    if (Phaser.Input.Keyboard.JustDown(attack)) {
      this.weapon.attack(this, this.facing.clone(), time);
    }
    if (Phaser.Input.Keyboard.JustDown(interact)) {
      this.tryInteract();
    }
  }

  tryInteract() {
    const targets = this.scene.interactables?.getChildren() ?? [];
    let best = null;
    let bestDist = Infinity;
    for (const t of targets) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, t.x, t.y);
      const r = t.interactRadius ?? 48;
      if (d <= r && d < bestDist) {
        best = t;
        bestDist = d;
      }
    }
    best?.interact?.(this);
  }

  // Daño agnóstico a la fuente; el contacto base quita medio corazón.
  takeHit(amount = 1) {
    if (this.lives <= 0) return;
    const time = this.scene.time.now;
    if (this.isInvulnerable(time)) return;
    this.health.hurt(amount);
    if (this.health.isEmpty()) {
      this.loseLife(time);
    } else {
      this.invulnerableUntil = time + HIT_IFRAMES;
    }
  }

  loseLife(time) {
    this.lives -= 1;
    if (this.lives <= 0) {
      this.scene.onGameOver();
      return;
    }
    this.health.full();
    this.invulnerableUntil = time + RESPAWN_IFRAMES;
    this.scene.hud?.refresh();
  }
}
