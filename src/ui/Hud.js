import Phaser from 'phaser';

// HUD fijo en cámara: corazones geométricos (rojo = entero,
// naranja = medio, gris = vacío) y contador de vidas.
// Observa la salud del jugador (patrón Observer).
export class Hud {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.makeHeartTextures();
    this.heartImgs = [0, 1, 2].map(
      (i) =>
        scene.add
          .image(28 + i * 30, 26, 'heart-full')
          .setScrollFactor(0)
          .setOrigin(0.5),
    );
    this.livesText = scene.add
      .text(16, 44, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
      .setScrollFactor(0);
    this.levelText = scene.add
      .text(16, 66, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
      .setScrollFactor(0);
    this.scoreText = scene.add
      .text(16, 88, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffd75e' })
      .setScrollFactor(0);
    player.health.onChanged(() => this.refresh());
  }

  makeHeartTextures() {
    this.drawHeart('heart-full', 0xff3355);
    this.drawHeart('heart-half', 0xff9933);
    this.drawHeart('heart-empty', 0x333344);
  }

  drawHeart(key, color) {
    if (this.scene.textures.exists(key)) return;
    const g = this.scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(color, 1);
    g.fillCircle(6, 6, 6);
    g.fillCircle(13, 6, 6);
    g.fillTriangle(0, 7, 19, 7, 9.5, 18);
    g.generateTexture(key, 20, 19);
    g.destroy();
  }

  refresh() {
    for (let i = 0; i < this.heartImgs.length; i += 1) {
      this.heartImgs[i].setTexture(`heart-${this.player.health.stateOf(i)}`);
    }
    this.livesText.setText(`Vidas: ${this.player.lives}`);
    this.levelText.setText(`Nivel: ${this.scene.level ?? 1}`);
    this.scoreText.setText(
      `Puntos: ${this.scene.run?.score ?? 0} Exp: ${this.scene.run?.exp ?? 0}`,
    );
  }
}
