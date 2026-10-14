import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { getLanguageConfig, getTranslations } from './services/translations.js';

// Traducila: cargar el mapa de traducciones antes de crear textos traducibles.
const initialLanguage = getLanguageConfig();
await getTranslations(initialLanguage);

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
  },
  scene: [MenuScene, GameScene],
};

new Phaser.Game(config);
