import Phaser from 'phaser';
import { SCORE_NEXT } from '../balance.js';

// HUD fijo en cámara: corazones geométricos (rojo = entero,
// naranja = medio, gris = vacío) y contador de vidas.
// Observa la salud del jugador (patrón Observer).
export class Hud {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.makeHeartTextures();
    this.renderedHearts = 0;
    this.heartImgs = [];
    this.livesText = scene.add
      .text(16, 44, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
      .setScrollFactor(0);
    this.levelText = scene.add
      .text(16, 66, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
      .setScrollFactor(0);
    this.scoreText = scene.add
      .text(16, 88, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffd75e' })
      .setScrollFactor(0);
    // Barra del jefe (paso 10): solo visible durante su pelea.
    this.bossBg = scene.add.rectangle(640, 26, 404, 22, 0x000000, 0.6).setScrollFactor(0);
    this.bossFill = scene.add
      .rectangle(442, 26, 396, 14, 0x9933cc)
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.bossLabel = scene.add
      .text(640, 54, 'POLLO MORADO', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#d9a0ff',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
    this.setBossVisible(false);
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
    const count = this.player.health.maxHearts;
    if (count !== this.renderedHearts) {
      for (const img of this.heartImgs) img.destroy();
      this.heartImgs = [];
      for (let i = 0; i < count; i += 1) {
        this.heartImgs.push(
          this.scene.add
            .image(28 + i * 30, 26, 'heart-full')
            .setScrollFactor(0)
            .setOrigin(0.5),
        );
      }
      this.renderedHearts = count;
    }
    for (let i = 0; i < this.heartImgs.length; i += 1) {
      this.heartImgs[i].setTexture(`heart-${this.player.health.stateOf(i)}`);
    }
    this.livesText.setText(`Vidas: ${this.player.lives}`);
    this.levelText.setText(`Nivel: ${this.scene.level ?? 1} PJ:${this.scene.run?.playerLevel ?? 1}`);
    this.scoreText.setText(`Puntos: ${this.scene.run?.score ?? 0}/${SCORE_NEXT}`);
  }

  setBossVisible(visible) {
    this.bossBg.setVisible(visible);
    this.bossFill.setVisible(visible);
    this.bossLabel.setVisible(visible);
  }

  refreshBoss() {
    const boss = this.scene.boss;
    if (!boss || !boss.active || boss.dead) {
      this.setBossVisible(false);
      return;
    }
    this.setBossVisible(true);
    const frac = Phaser.Math.Clamp(boss.hp / boss.maxHp, 0, 1);
    this.bossFill.displayWidth = 396 * frac;
  }
}
