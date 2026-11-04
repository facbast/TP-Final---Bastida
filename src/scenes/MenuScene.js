import Phaser from 'phaser';
import { getTopScore } from '../storage.js';
import { getPhrase, getTranslations, getLanguageConfig } from '../services/translations.js';
import { EN, ES } from '../enums/languages.js';
import { KEYS } from '../enums/keys.js';

// Pantalla de título: nombre, controles e inicio (paso 10).
// Los textos visibles se resuelven tras cargar las traducciones.
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.language = getLanguageConfig();
    getTranslations(this.language, () => this.buildUI());
  }

  // Cambia el idioma sin recargar el juego: reconstruye el menú traducido.
  setLanguage(language) {
    if (language === this.language) return;
    getTranslations(language, () => {
      this.language = language;
      this.children.removeAll(true);
      this.buildUI();
    });
  }

  buildUI() {
    this.cameras.main.fadeIn(200, 0, 0, 0);
    const cx = 640;
    this.add
      .text(cx, 220, 'ROUGE EGG', {
        fontFamily: 'monospace',
        fontSize: '72px',
        color: '#ffd75e',
      })
      .setOrigin(0.5);
    this.add
      .text(cx, 290, getPhrase(KEYS.INFILTRA_LA_GUARIDA_DE_LOS_POLLOS_MUTANTES), {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    const controls = [
      getPhrase(KEYS.FLECHAS_MOVERSE_ESTE_DERECHA),
      getPhrase(KEYS.Z_DASH_MANTENE_PARA_MAS_DISTANCIA_X_ATAQUE_C_INTERACTUAR),
      getPhrase(KEYS.TEXT_1_2_3_ELEGIR_BONIFICACION_AL_SUBIR_DE_NIVEL),
      getPhrase(KEYS.SHIFT_M_MAPA_DEL_PISO),
    ];
    controls.forEach((line, i) => {
      this.add
        .text(cx, 370 + i * 32, line, {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#9aa0b0',
        })
        .setOrigin(0.5);
    });
    const start = this.add
      .text(cx, 520, getPhrase(KEYS.PULSA_ENTER_PARA_EMPEZAR), {
        fontFamily: 'monospace',
        fontSize: '26px',
        color: '#33ff88',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    start.on('pointerdown', () => this.begin());
    const top = getTopScore();
    if (top > 0) {
      this.add
        .text(cx, 566, `Récord: ${top} pts`, {
          fontFamily: 'monospace',
          fontSize: '20px',
          color: '#ffd75e',
        })
        .setOrigin(0.5);
    }
    // Botón ES/EN: los códigos de idioma no se traducen.
    const next = this.language === ES ? EN : ES;
    const toggle = this.add
      .text(1280 - 28, 26, next.toUpperCase(), {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: '#9aa0b0',
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    toggle.on('pointerdown', () => this.setLanguage(next));
    toggle.on('pointerover', () => toggle.setColor('#ffd75e'));
    toggle.on('pointerout', () => toggle.setColor('#9aa0b0'));
    this.tweens.add({
      targets: start,
      alpha: 0.35,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
    this.input.keyboard.on('keydown-ENTER', () => this.begin());
  }

  begin() {
    const cam = this.cameras.main;
    cam.fadeOut(250, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
  }
}
