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
// Radio de registro del jugador para la niebla de guerra (Spec 0002).
const REVEAL_DIST = 700;

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
    // M es alternativa a Shift para diagnóstico y accesibilidad.
    this.mapOpen = false;
    const kb = scene.input.keyboard;
    this.shiftKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.mapKeyAlt = kb.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    const toggle = () => {
      this.mapOpen = !this.mapOpen;
    };
    kb.on('keydown-SHIFT', toggle);
    kb.on('keydown-M', toggle);
    this.lastRefresh = 0;
    this.miniScale = ZOOM;
    this.fullScale = 1;
    this.wallRects = [];
  }

  // Guarda paredes del piso actual (centros y tamaños en px de mundo) y la
  // grilla para la niebla de guerra (Spec 0002).
  rebuild(worldW, worldH, walls, gridInfo = null) {
    this.wallRects = walls.getChildren().map((w) => ({
      x: w.x,
      y: w.y,
      w: w.displayWidth,
      h: w.displayHeight,
    }));
    this.gridInfo = gridInfo;
    this.explored = new Set();
    const span = Math.max(worldW, worldH);
    this.fullScale = FULL_SIZE / span;
    this.fullStatic.clear();
    const fx = 640 - (worldW * this.fullScale) / 2;
    const fy = 360 - (worldH * this.fullScale) / 2;
    this.fullStatic.setPosition(fx, fy);
    this.fullOX = fx;
    this.fullOY = fy;
  }

  cellKey(cx, cy) {
    return cy * this.gridInfo.cols + cx;
  }

  cellOf(x, y) {
    return {
      cx: Math.floor(x / this.gridInfo.cell),
      cy: Math.floor(y / this.gridInfo.cell),
    };
  }

  isExplored(x, y) {
    if (!this.gridInfo) return true;
    const { cx, cy } = this.cellOf(x, y);
    if (cx < 0 || cy < 0 || cx >= this.gridInfo.cols || cy >= this.gridInfo.rows) {
      return false;
    }
    return this.explored.has(this.cellKey(cx, cy));
  }

  // Registra celdas dentro del radio del jugador (persisten todo el piso).
  explore(px, py) {
    if (!this.gridInfo) return;
    const { cols, rows, cell } = this.gridInfo;
    const range = Math.ceil(REVEAL_DIST / cell);
    const { cx, cy } = this.cellOf(px, py);
    for (let j = cy - range; j <= cy + range; j += 1) {
      for (let i = cx - range; i <= cx + range; i += 1) {
        if (i < 0 || j < 0 || i >= cols || j >= rows) continue;
        const wx = i * cell + cell / 2;
        const wy = j * cell + cell / 2;
        if (Math.hypot(wx - px, wy - py) <= REVEAL_DIST) {
          this.explored.add(this.cellKey(i, j));
        }
      }
    }
  }

  drawZoomed(px, py) {
    const s = this.miniScale;
    const half = MINI_SIZE / 2;
    this.mini.clear();
    this.mini.fill(0x000000, 0.55, 0, 0, MINI_SIZE, MINI_SIZE);
    for (const r of this.wallRects) {
      if (!this.isExplored(r.x, r.y)) continue;
      const x = half + (r.x - r.w / 2 - px) * s;
      const y = half + (r.y - r.h / 2 - py) * s;
      const w = r.w * s;
      const h = r.h * s;
      if (x + w < 0 || y + h < 0 || x > MINI_SIZE || y > MINI_SIZE) continue;
      this.mini.fill(0xffffff, 0.85, x, y, Math.max(1, w), Math.max(1, h));
    }
    this.dots.clear();
    const dot = (wx, wy, color, size, always = false) => {
      if (!always) {
        const dx = wx - px;
        const dy = wy - py;
        if (Math.hypot(dx, dy) > VIEW_DIST || !this.isExplored(wx, wy)) return;
        this.dots.fillStyle(color, 1);
        this.dots.fillCircle(this.miniX + half + dx * s, this.miniY + half + dy * s, size);
      } else {
        this.dots.fillStyle(color, 1);
        this.dots.fillCircle(this.miniX + half, this.miniY + half, size);
      }
    };
    const sc = this.scene;
    for (const t of sc.pickups.getChildren()) dot(t.x, t.y, 0xffd75e, 2.5);
    if (sc.exitPos) dot(sc.exitPos.x, sc.exitPos.y, 0x33ff88, 3);
    for (const e of sc.enemies.getChildren()) dot(e.x, e.y, 0xff3355, 2.5);
    dot(px, py, 0x3388ff, 3.5, true);
  }

  drawFull() {
    const sc = this.scene;
    this.fullStatic.clear();
    for (const r of this.wallRects) {
      if (!this.isExplored(r.x, r.y)) continue;
      this.fullStatic.fill(
        0xffffff,
        0.9,
        r.x * this.fullScale - (r.w * this.fullScale) / 2,
        r.y * this.fullScale - (r.h * this.fullScale) / 2,
        Math.max(1, r.w * this.fullScale),
        Math.max(1, r.h * this.fullScale),
      );
    }
    this.fullDots.clear();
    const dot = (wx, wy, color, size, always = false) => {
      if (!always && !this.isExplored(wx, wy)) return;
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
    dot(sc.player.x, sc.player.y, 0x3388ff, 5, true);
  }

  update(time) {
    const held =
      this.mapOpen ||
      (this.shiftKey && this.shiftKey.isDown) ||
      (this.mapKeyAlt && this.mapKeyAlt.isDown);
    this.fullBg.setVisible(held);
    this.fullStatic.setVisible(held);
    this.fullDots.setVisible(held);
    if (time - this.lastRefresh < REFRESH_MS) return;
    this.lastRefresh = time;
    const p = this.scene.player;
    this.explore(p.x, p.y);
    this.drawZoomed(p.x, p.y);
    this.drawFull();
  }
}
