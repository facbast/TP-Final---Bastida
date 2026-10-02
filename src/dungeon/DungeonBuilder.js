import Phaser from 'phaser';

// Construye la mazmorra en la escena: fondo de roca, suelo por celdas y
// muros estáticos en cada celda sólida adyacente al suelo.
export const CELL = 160;

export class DungeonBuilder {
  constructor(scene) {
    this.scene = scene;
  }

  build(dungeon) {
    const s = this.scene;
    const width = dungeon.cols * CELL;
    const height = dungeon.rows * CELL;
    s.physics.world.setBounds(0, 0, width, height);
    s.add.rectangle(width / 2, height / 2, width, height, 0x14141f);

    const floor = s.add.graphics();
    floor.fillStyle(0x23232f, 1);
    for (let y = 0; y < dungeon.rows; y += 1) {
      for (let x = 0; x < dungeon.cols; x += 1) {
        if (dungeon.grid[y][x]) floor.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    const isFloor = (x, y) =>
      x >= 0 && y >= 0 && x < dungeon.cols && y < dungeon.rows && dungeon.grid[y][x];
    const walls = s.physics.add.staticGroup();
    for (let y = 0; y < dungeon.rows; y += 1) {
      for (let x = 0; x < dungeon.cols; x += 1) {
        if (isFloor(x, y)) continue;
        let bordersFloor = false;
        for (let j = -1; j <= 1 && !bordersFloor; j += 1) {
          for (let i = -1; i <= 1; i += 1) {
            if ((i !== 0 || j !== 0) && isFloor(x + i, y + j)) {
              bordersFloor = true;
              break;
            }
          }
        }
        if (!bordersFloor) continue;
        const rect = s.add.rectangle(
          x * CELL + CELL / 2,
          y * CELL + CELL / 2,
          CELL,
          CELL,
          0x3a3a4d,
        );
        s.physics.add.existing(rect, true);
        walls.add(rect);
      }
    }

    const toWorld = (c) => ({ x: c.x * CELL + CELL / 2, y: c.y * CELL + CELL / 2 });
    return {
      width,
      height,
      walls,
      spawn: toWorld(dungeon.spawnCell),
      exit: toWorld(dungeon.exitCell),
    };
  }
}
