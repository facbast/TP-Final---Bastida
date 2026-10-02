// Generador procedural puro (sin Phaser): salas rectangulares sin solapar
// conectadas en cadena por pasillos en L (conectividad total garantizada).
// Decisiones de usuario del paso 3; no son reglas del GDD.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function centerOf(room) {
  return {
    x: room.x + Math.floor(room.w / 2),
    y: room.y + Math.floor(room.h / 2),
  };
}

export function generateDungeon({
  cols,
  rows,
  roomCount,
  minRoom = 4,
  maxRoom = 8,
  seed = 1,
}) {
  const rand = mulberry32(seed);
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const rooms = [];
  let attempts = 0;
  while (rooms.length < roomCount && attempts < roomCount * 100) {
    attempts += 1;
    const w = minRoom + Math.floor(rand() * (maxRoom - minRoom + 1));
    const h = minRoom + Math.floor(rand() * (maxRoom - minRoom + 1));
    const x = 1 + Math.floor(rand() * (cols - w - 2));
    const y = 1 + Math.floor(rand() * (rows - h - 2));
    const overlaps = rooms.some(
      (r) => x < r.x + r.w + 1 && x + w + 1 > r.x && y < r.y + r.h + 1 && y + h + 1 > r.y,
    );
    if (overlaps) continue;
    rooms.push({ x, y, w, h });
  }

  const carve = (x, y) => {
    if (x >= 0 && y >= 0 && x < cols && y < rows) grid[y][x] = true;
  };
  for (const r of rooms) {
    for (let j = r.y; j < r.y + r.h; j += 1) {
      for (let i = r.x; i < r.x + r.w; i += 1) carve(i, j);
    }
  }
  const carveCorridor = (a, b) => {
    let x = a.x;
    let y = a.y;
    const hStep = () => {
      while (x !== b.x) {
        carve(x, y);
        x += Math.sign(b.x - x);
      }
    };
    const vStep = () => {
      while (y !== b.y) {
        carve(x, y);
        y += Math.sign(b.y - y);
      }
    };
    if (rand() < 0.5) {
      hStep();
      vStep();
    } else {
      vStep();
      hStep();
    }
    carve(b.x, b.y);
  };
  for (let i = 1; i < rooms.length; i += 1) {
    carveCorridor(centerOf(rooms[i - 1]), centerOf(rooms[i]));
  }

  const spawnCell = centerOf(rooms[0]);
  let exitRoom = rooms[0];
  let best = -1;
  for (const r of rooms) {
    const c = centerOf(r);
    const d = (c.x - spawnCell.x) ** 2 + (c.y - spawnCell.y) ** 2;
    if (d > best) {
      best = d;
      exitRoom = r;
    }
  }
  return { cols, rows, grid, rooms, spawnCell, exitCell: centerOf(exitRoom), seed };
}

export function floorCount(dungeon) {
  return dungeon.grid.flat().filter(Boolean).length;
}

// BFS desde la aparición: todas las salas deben ser alcanzables.
export function isConnected(dungeon) {
  const { cols, rows, grid } = dungeon;
  const key = (x, y) => y * cols + x;
  const seen = new Set([key(dungeon.spawnCell.x, dungeon.spawnCell.y)]);
  const queue = [[dungeon.spawnCell.x, dungeon.spawnCell.y]];
  while (queue.length > 0) {
    const [x, y] = queue.pop();
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || !grid[ny][nx]) continue;
      if (seen.has(key(nx, ny))) continue;
      seen.add(key(nx, ny));
      queue.push([nx, ny]);
    }
  }
  return dungeon.rooms.every((r) => {
    const c = centerOf(r);
    return seen.has(key(c.x, c.y));
  });
}
