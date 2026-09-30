import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Hud } from '../ui/Hud.js';

// Mundo de prueba ampliado para dar recorrido a la cámara
// (la arena fija se reemplaza por mazmorra procedural en el paso 3).
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1200;
const WALL = 32;
// Anticipación de cámara hacia la dirección presionada (px).
const LOOKAHEAD = 90;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    // Grupos de dominio: enemigos (paso 4), interactuables (pasos 3/6) y muros.
    this.enemies = this.physics.add.group();
    this.interactables = this.add.group();
    this.buildWalls();
    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    this.physics.add.collider(this.player, this.walls);
    // Contacto base: medio corazón por golpe (decisión paso 2).
    this.physics.add.overlap(this.player, this.enemies, (player) => {
      player.takeHit(1);
    });
    this.hud = new Hud(this, this.player);
    this.hud.refresh();
    this.gameEnded = false;

    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    cam.startFollow(this.player, false, 0.12, 0.12);

    // Enemigo básico (rojo): triángulo, solo visual por ahora (paso 4).
    this.add.triangle(200, 150, 0, 32, 32, 32, 16, 0, 0xff0000);
  }

  buildWalls() {
    this.walls = this.physics.add.staticGroup();
    const spans = [
      [WORLD_WIDTH / 2, WALL / 2, WORLD_WIDTH, WALL],
      [WORLD_WIDTH / 2, WORLD_HEIGHT - WALL / 2, WORLD_WIDTH, WALL],
      [WALL / 2, WORLD_HEIGHT / 2, WALL, WORLD_HEIGHT],
      [WORLD_WIDTH - WALL / 2, WORLD_HEIGHT / 2, WALL, WORLD_HEIGHT],
    ];
    for (const [x, y, w, h] of spans) {
      const rect = this.add.rectangle(x, y, w, h, 0x444466);
      this.physics.add.existing(rect, true);
      this.walls.add(rect);
    }
  }

  update(time, delta) {
    if (this.gameEnded) return;
    this.player.update(time, delta);
    this.updateCameraLookahead();
  }

  onGameOver() {
    this.gameEnded = true;
    this.player.body.setVelocity(0, 0);
    const cam = this.cameras.main;
    const cx = cam.scrollX + cam.width / 2;
    const cy = cam.scrollY + cam.height / 2;
    this.add.rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.7).setScrollFactor(0);
    this.add
      .text(400, 280, 'GAME OVER', {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: '#ff3355',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.add
      .text(400, 340, 'Pulsa R para reiniciar', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
  }

  // Asoma la cámara hacia las flechas presionadas, con suavizado.
  updateCameraLookahead() {
    const cam = this.cameras.main;
    const targetX = this.player.moveDir.x * LOOKAHEAD;
    const targetY = this.player.moveDir.y * LOOKAHEAD;
    cam.followOffset.x += (targetX - cam.followOffset.x) * 0.08;
    cam.followOffset.y += (targetY - cam.followOffset.y) * 0.08;
  }
}
