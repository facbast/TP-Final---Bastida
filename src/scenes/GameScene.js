import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Hud } from '../ui/Hud.js';
import { createEnemy } from '../entities/EnemyFactory.js';
import { generateDungeon } from '../dungeon/Dungeon.js';
import { DungeonBuilder } from '../dungeon/DungeonBuilder.js';
import { ExitPortal } from '../dungeon/ExitPortal.js';
import longswordUrl from '../../Assets/weapon_longsword.png';
import bowUrl from '../../Assets/weapon_bow.png';
import arrowUrl from '../../Assets/weapon_arrow.png';
import bowArrowUrl from '../../Assets/weapon_bow_arrow.png';
import staffUrl from '../../Assets/weapon_staff.png';

// Población por nivel 1, fuera de la sala inicial (pasos 4-5).
const BASIC_COUNT = 4;
const PURSUER_COUNT = 2;
const SWORDSMAN_COUNT = 2;
const TOXIC_COUNT = 2;
const GUNNER_COUNT = 2;
const MAGE_COUNT = 1;
const SPAWN_MIN_DIST = 500;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // Pixel-art blanco pensado para tintes por clase (carpeta Assets/).
    this.load.image('weapon-longsword', longswordUrl);
    this.load.image('weapon-bow', bowUrl);
    this.load.image('weapon-arrow', arrowUrl);
    this.load.image('weapon-bow-arrow', bowArrowUrl);
    this.load.image('weapon-staff', staffUrl);
  }

  create(data = {}) {
    // Estado de la partida que persiste entre niveles (GDD, Persistencia, p. 2).
    const run = data.run ?? { level: 1, halves: 6, lives: 3, score: 0, exp: 0 };
    this.run = run;
    this.level = run.level;
    // Pixel nítido para el pixel-art de armas.
    for (const key of ['weapon-longsword', 'weapon-bow', 'weapon-arrow', 'weapon-bow-arrow', 'weapon-staff']) {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    const dungeon = generateDungeon({
      seed: (Math.random() * 2 ** 31) | 0,
      cols: 30,
      rows: 22,
      roomCount: 5 + this.level,
      minRoom: 4,
      maxRoom: 8,
    });
    const built = new DungeonBuilder(this).build(dungeon);

    // Grupos de dominio: enemigos (pasos 4-5), balas enemigas, interactuables
    // (tesoros paso 6), peligros de zona (charcos) y muros.
    this.enemies = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.hazards = this.physics.add.staticGroup();
    this.interactables = this.add.group();
    this.walls = built.walls;
    this.player = new Player(this, built.spawn.x, built.spawn.y, {
      halves: run.halves,
      lives: run.lives,
    });
    this.physics.add.collider(this.player, this.walls);
    // Contacto base: medio corazón por golpe (decisión paso 2).
    this.physics.add.overlap(this.player, this.enemies, (player) => {
      player.takeHit(1);
    });
    // Charcos de toxina: medio corazón por golpe (paso 5c).
    this.physics.add.overlap(this.player, this.hazards, (player) => {
      player.takeHit(1);
    });
    // Balas enemigas: dañan al jugador salvo reflejadas (paso 5d).
    this.physics.add.overlap(this.player, this.enemyBullets, (player, bullet) => {
      if (!bullet.reflected) player.takeHit(1);
    });
    // Balas reflejadas: dañan enemigos (paso 5d).
    this.physics.add.overlap(this.enemyBullets, this.enemies, (bullet, enemy) => {
      if (bullet.reflected && !enemy.dead) {
        enemy.takeDamage?.(1);
        if (enemy.active) enemy.applyKnockback?.(bullet.x, bullet.y);
      }
    });
    this.physics.add.collider(this.enemyBullets, this.walls, (bullet) => {
      bullet.destroy();
    });

    this.interactables.add(new ExitPortal(this, built.exit.x, built.exit.y));
    this.spawnEnemies(built);

    this.hud = new Hud(this, this.player);
    this.hud.refresh();
    this.gameEnded = false;

    const cam = this.cameras.main;
    cam.setBounds(0, 0, built.width, built.height);
    cam.startFollow(this.player, false, 0.12, 0.12);
  }

  spawnEnemies(built) {
    const options = built.rooms.slice(1);
    const placements = [
      ...Array(BASIC_COUNT).fill('basic'),
      ...Array(PURSUER_COUNT).fill('pursuer'),
      ...Array(SWORDSMAN_COUNT).fill('swordsman'),
      ...Array(TOXIC_COUNT).fill('toxic'),
      ...Array(GUNNER_COUNT).fill('gunner'),
      ...Array(MAGE_COUNT).fill('mage'),
    ];
    for (const type of placements) {
      if (options.length === 0) break;
      const room = Phaser.Utils.Array.RemoveRandomElement(options);
      const pos = this.roomPosition(room, built.spawn);
      if (!pos) continue;
      this.enemies.add(createEnemy(this, type, pos.x, pos.y));
    }
    this.physics.add.collider(this.enemies, this.walls, (enemy) => {
      enemy.pickDirection?.();
    });
  }

  roomPosition(room, spawn) {
    for (let tries = 0; tries < 10; tries += 1) {
      const x = room.x + 100 + Math.random() * (room.w - 200);
      const y = room.y + 100 + Math.random() * (room.h - 200);
      if (Phaser.Math.Distance.Between(x, y, spawn.x, spawn.y) >= SPAWN_MIN_DIST) {
        return { x, y };
      }
    }
    return null;
  }

  onEnemyKilled(enemy) {
    this.run.score += enemy.score;
    this.run.exp += enemy.exp;
    this.hud?.refresh();
  }

  nextLevel() {
    if (this.gameEnded) return;
    this.scene.restart({
      run: {
        level: this.level + 1,
        halves: this.player.health.halves,
        lives: this.player.lives,
        score: this.run.score,
        exp: this.run.exp,
      },
    });
  }

  update(time, delta) {
    if (this.gameEnded) return;
    this.player.update(time, delta);
    for (const enemy of this.enemies.getChildren()) {
      enemy.update?.(time, delta);
    }
    this.updateCameraLookahead();
  }

  // Asoma la cámara hacia las flechas presionadas, con suavizado.
  updateCameraLookahead() {
    const cam = this.cameras.main;
    const targetX = this.player.moveDir.x * 90;
    const targetY = this.player.moveDir.y * 90;
    cam.followOffset.x += (targetX - cam.followOffset.x) * 0.08;
    cam.followOffset.y += (targetY - cam.followOffset.y) * 0.08;
  }

  onGameOver() {
    this.gameEnded = true;
    this.player.body.setVelocity(0, 0);
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;
    this.add.rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.7).setScrollFactor(0);
    this.add
      .text(cx, cy - 20, 'GAME OVER', {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: '#ff3355',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.add
      .text(cx, cy + 40, 'Pulsa R para reiniciar', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
  }
}
