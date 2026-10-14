import Phaser from 'phaser';

// Minimapa de esquina con zoom cerca del jugador (centrado en él) + mapa
// grande del piso entero con Shift izquierdo (mantener).
// Negro translúcido, paredes blancas, jugador azul, enemigos rojos,
// tesoros amarillos y portal verde. Refresco con throttle.
const MINI_SIZE = 168;
const MINI_MARGIN = 16;
const ZOOM = 0.14;
const FULL_SIZE = 560;
const REFRESH_MS = 120;
const VIEW_DIST = 700;

export class Minimap {
  constructor(scene) {
    this.scene = scene;
    const viewH = scene.cameras.main.height;
    this.miniX = MINI_MARGIN;
    this.miniY = viewH - MINI_MARGIN - MINI_SIZE;
    this.mini = scene.add
      .renderTexture(this.miniX, this.miniY, MINI_SIZE, MINI_SIZE)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(90);
    this.dots = scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(91);
    // Mapa grande centrado (oculto hasta pulsar Shift): objetos directos
    // (un Container en el origen sería descartado por la cámara).
    this.fullBg = scene.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.55)
      .setScrollFactor(0)
      .setDepth(95)
      .setVisible(false);
    this.fullStatic = scene.add
      .renderTexture(0, 0, FULL_SIZE, FULL_SIZE)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(96)
      .setVisible(false);
    this.fullDots = scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(97)
      .setVisible(false);
    // Doble mecanismo: eventos + polling por si un canal falla.
    // El mapa grande es interruptor: una pulsación lo muestra, otra lo oculta.
    this.mapOpen = false;
    const kb = scene.input.keyboard;
    this.shiftKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    kb.on('keydown-SHIFT', () => {
      this.mapOpen = !this.mapOpen;
    });
    this.lastRefresh = 0;
    this.miniScale = ZOOM;
    this.fullScale = 1;
    this.wallRects = [];
  }

  // Guarda paredes del piso actual (centros y tamaños en px de mundo).
  rebuild(worldW, worldH, walls) {
    this.wallRects = walls.getChildren().map((w) => ({
      x: w.x,
      y: w.y,
      w: w.displayWidth,
      h: w.displayHeight,
    }));
    const span = Math.max(worldW, worldH);
    this.fullScale = FULL_SIZE / span;
    this.fullStatic.clear();
    const fx = 640 - (worldW * this.fullScale) / 2;
    const fy = 360 - (worldH * this.fullScale) / 2;
    this.fullStatic.setPosition(fx, fy);
    this.fullOX = fx;
    this.fullOY = fy;
    for (const r of this.wallRects) {
      this.fullStatic.fill(
        0xffffff,
        0.9,
        r.x * this.fullScale - (r.w * this.fullScale) / 2,
        r.y * this.fullScale - (r.h * this.fullScale) / 2,
        Math.max(1, r.w * this.fullScale),
        Math.max(1, r.h * this.fullScale),
      );
    }
  }

  drawZoomed(px, py) {
    const s = this.miniScale;
    const half = MINI_SIZE / 2;
    this.mini.clear();
    this.mini.fill(0x000000, 0.55, 0, 0, MINI_SIZE, MINI_SIZE);
    for (const r of this.wallRects) {
      const x = half + (r.x - r.w / 2 - px) * s;
      const y = half + (r.y - r.h / 2 - py) * s;
      const w = r.w * s;
      const h = r.h * s;
      if (x + w < 0 || y + h < 0 || x > MINI_SIZE || y > MINI_SIZE) continue;
      this.mini.fill(0xffffff, 0.85, x, y, Math.max(1, w), Math.max(1, h));
    }
    this.dots.clear();
    const dot = (wx, wy, color, size) => {
      const dx = wx - px;
      const dy = wy - py;
      if (Math.hypot(dx, dy) > VIEW_DIST) return;
      this.dots.fillStyle(color, 1);
      this.dots.fillCircle(this.miniX + half + dx * s, this.miniY + half + dy * s, size);
    };
    const sc = this.scene;
    for (const t of sc.pickups.getChildren()) dot(t.x, t.y, 0xffd75e, 2.5);
    if (sc.exitPos) dot(sc.exitPos.x, sc.exitPos.y, 0x33ff88, 3);
    for (const e of sc.enemies.getChildren()) dot(e.x, e.y, 0xff3355, 2.5);
    dot(px, py, 0x3388ff, 3.5);
  }

  drawFull() {
    const sc = this.scene;
    this.fullDots.clear();
    const dot = (wx, wy, color, size) => {
      this.fullDots.fillStyle(color, 1);
      this.fullDots.fillCircle(
        this.fullOX + wx * this.fullScale,
        this.fullOY + wy * this.fullScale,
        size,
      );
    };
    for (const t of sc.pickups.getChildren()) dot(t.x, t.y, 0xffd75e, 4);
    if (sc.exitPos) dot(sc.exitPos.x, sc.exitPos.y, 0x33ff88, 5);
    for (const e of sc.enemies.getChildren()) dot(e.x, e.y, 0xff3355, 4);
    dot(sc.player.x, sc.player.y, 0x3388ff, 5);
  }

  update(time) {
    const held = this.mapOpen || (this.shiftKey && this.shiftKey.isDown);
    this.fullBg.setVisible(held);
    this.fullStatic.setVisible(held);
    this.fullDots.setVisible(held);
    if (time - this.lastRefresh < REFRESH_MS) return;
    this.lastRefresh = time;
    const p = this.scene.player;
    this.drawZoomed(p.x, p.y);
    this.drawFull();
  }
}
