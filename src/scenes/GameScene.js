import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Hud } from '../ui/Hud.js';
import { createEnemy } from '../entities/EnemyFactory.js';
import { generateDungeon } from '../dungeon/Dungeon.js';
import { DungeonBuilder } from '../dungeon/DungeonBuilder.js';
import { ExitPortal } from '../dungeon/ExitPortal.js';
import { Treasure } from '../entities/Treasure.js';
import { SpikeTrap } from '../entities/SpikeTrap.js';
import { TimedSpikes } from '../entities/TimedSpikes.js';
import { SCORE_NEXT, compositionFor } from '../balance.js';
import longswordUrl from '../../Assets/weapon_longsword.png';
import bowUrl from '../../Assets/weapon_bow.png';
import arrowUrl from '../../Assets/weapon_arrow.png';
import bowArrowUrl from '../../Assets/weapon_bow_arrow.png';
import staffUrl from '../../Assets/weapon_staff.png';

// Población y trampas por nivel: ver compositionFor en balance.js (paso 8).
const SPAWN_MIN_DIST = 500;
// Subida de nivel de jugador (decisión de usuario, en puntos; ver balance.js).
const TREASURE_VALUE = 25;
// Población y trampas: ver compositionFor en balance.js.
const TRAP_MIN_DIST = 700;
const EXIT_MIN_DIST = 200;
const BONUSES = [
  { label: '1 - Corazón máximo +1 (cura completa)' },
  { label: '2 - Velocidad +10%' },
  { label: '3 - Dash recarga 15% más rápido' },
];

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
    const run = data.run ?? {
      level: 1,
      halves: 6,
      lives: 3,
      score: 0,
      playerLevel: 1,
    };
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
      roomCount: compositionFor(this.level).rooms,
      minRoom: 4,
      maxRoom: 8,
    });
    const built = new DungeonBuilder(this).build(dungeon);

    // Grupos de dominio: enemigos (pasos 4-5), balas enemigas, interactuables
    // (tesoros paso 6), peligros de zona (charcos) y muros.
    this.enemies = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.hazards = this.physics.add.staticGroup();
    this.pickups = this.physics.add.staticGroup();
    this.interactables = this.add.group();
    this.walls = built.walls;
    this.player = new Player(this, built.spawn.x, built.spawn.y, {
      halves: run.halves,
      lives: run.lives,
      maxHearts: run.maxHearts,
      speedMul: run.speedMul,
      dashCdMul: run.dashCdMul,
    });
    this.physics.add.collider(this.player, this.walls);
    // Contacto base: medio corazón por golpe (decisión paso 2).
    this.physics.add.overlap(this.player, this.enemies, (player) => {
      player.takeHit(1);
    });
    // Charcos y trampas: medio corazón por golpe (pasos 5c y 7).
    // Las temporizadas solo dañan armadas.
    this.physics.add.overlap(this.player, this.hazards, (player, hazard) => {
      if (hazard.armed !== false) player.takeHit(1);
    });
    // Las trampas también dañan enemigos (otorgan puntos y exp igual).
    this.physics.add.overlap(this.enemies, this.hazards, (enemy, hazard) => {
      if (hazard.hurtsEnemies && hazard.armed !== false && !enemy.dead) {
        enemy.takeDamage(1);
      }
    });
    // Cofres: recolección automática al contacto.
    this.physics.add.overlap(this.player, this.pickups, (player, treasure) => {
      this.collectTreasure(treasure);
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
    this.spawnTreasures(built);
    this.spawnTraps(built);

    this.hud = new Hud(this, this.player);
    this.hud.refresh();
    this.gameEnded = false;
    this.levelUpOpen = false;
    this.input.keyboard.on('keydown-ONE', () => this.chooseBonus(0));
    this.input.keyboard.on('keydown-TWO', () => this.chooseBonus(1));
    this.input.keyboard.on('keydown-THREE', () => this.chooseBonus(2));

    const cam = this.cameras.main;
    cam.setBounds(0, 0, built.width, built.height);
    cam.startFollow(this.player, false, 0.12, 0.12);
  }

  spawnEnemies(built) {
    const comp = compositionFor(this.level);
    const rooms = built.rooms.slice(1);
    if (rooms.length === 0) return;
    const placements = [
      ...Array(comp.basic).fill('basic'),
      ...Array(comp.pursuer).fill('pursuer'),
      ...Array(comp.swordsman).fill('swordsman'),
      ...Array(comp.toxic).fill('toxic'),
      ...Array(comp.gunner).fill('gunner'),
      ...Array(comp.mage).fill('mage'),
    ];
    // Varias presencias por sala: los conteos se cumplen siempre.
    for (const type of placements) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
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

  spawnTraps(built) {
    const comp = compositionFor(this.level);
    const options = built.floor.filter(
      (c) =>
        Phaser.Math.Distance.Between(c.x, c.y, built.spawn.x, built.spawn.y) >= TRAP_MIN_DIST &&
        Phaser.Math.Distance.Between(c.x, c.y, built.exit.x, built.exit.y) >= EXIT_MIN_DIST,
    );
    const takeCell = () => {
      if (options.length === 0) return null;
      return Phaser.Utils.Array.RemoveRandomElement(options);
    };
    for (let n = 0; n < comp.spikes; n += 1) {
      const c = takeCell();
      if (c) this.hazards.add(new SpikeTrap(this, c.x, c.y));
    }
    for (let n = 0; n < comp.timed; n += 1) {
      const c = takeCell();
      if (c) this.hazards.add(new TimedSpikes(this, c.x, c.y));
    }
  }

  onEnemyKilled(enemy) {
    this.run.score += enemy.score;
    this.hud?.refresh();
    this.checkLevelUp();
  }

  spawnTreasures(built) {
    for (const room of built.rooms.slice(1)) {
      const x = room.x + 120 + Math.random() * (room.w - 240);
      const y = room.y + 120 + Math.random() * (room.h - 240);
      new Treasure(this, x, y, TREASURE_VALUE);
    }
  }

  collectTreasure(treasure) {
    this.run.score += treasure.value;
    const popup = this.add
      .text(treasure.x, treasure.y - 24, `+${treasure.value}`, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffd75e',
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: popup,
      y: popup.y - 32,
      alpha: 0,
      duration: 800,
      onComplete: () => popup.destroy(),
    });
    treasure.destroy();
    this.hud?.refresh();
    this.checkLevelUp();
  }

  checkLevelUp() {
    if (this.levelUpOpen || this.gameEnded) return;
    if (this.run.score < SCORE_NEXT) return;
    this.run.score -= SCORE_NEXT;
    this.run.playerLevel += 1;
    this.player.lives += 1;
    this.openBonusChoice();
  }

  openBonusChoice() {
    this.levelUpOpen = true;
    this.physics.pause();
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;
    this.bonusUI = this.add.container(0, 0);
    const bg = this.add.rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.7);
    const title = this.add
      .text(cx, cy - 80, `¡Nivel ${this.run.playerLevel}! Elige bonificación`, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffd75e',
      })
      .setOrigin(0.5);
    this.bonusUI.add([bg, title]);
    BONUSES.forEach((bonus, i) => {
      this.bonusUI.add(
        this.add
          .text(cx, cy + i * 36, bonus.label, {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffffff',
          })
          .setOrigin(0.5),
      );
    });
    this.bonusUI.setScrollFactor(0);
    this.hud?.refresh();
  }

  chooseBonus(i) {
    if (!this.levelUpOpen || i < 0 || i > 2) return;
    if (i === 0) this.player.addMaxHeart();
    else if (i === 1) this.player.boostSpeed();
    else this.player.reduceDashCooldown();
    this.bonusUI?.destroy(true);
    this.bonusUI = null;
    this.levelUpOpen = false;
    this.physics.resume();
    this.hud?.refresh();
    this.checkLevelUp();
  }

  nextLevel() {
    if (this.gameEnded) return;
    this.scene.restart({
      run: {
        level: this.level + 1,
        halves: this.player.health.halves,
        lives: this.player.lives,
        score: this.run.score,
        playerLevel: this.run.playerLevel,
        maxHearts: this.player.health.maxHearts,
        speedMul: this.player.speedMul,
        dashCdMul: this.player.dashCdMul,
      },
    });
  }

  update(time, delta) {
    if (this.gameEnded || this.levelUpOpen) return;
    this.player.update(time, delta);
    for (const enemy of this.enemies.getChildren()) {
      enemy.update?.(time, delta);
    }
    for (const hazard of this.hazards.getChildren()) {
      hazard.update?.(time, delta);
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
