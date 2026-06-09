const fs = require('fs');

const buffer = fs.readFileSync(0, 'utf8');
const lines = buffer.toString().split('\n').filter(line => line.trim().length > 0);

if (lines.length < 2) {
  console.log(-1);
  process.exit(0);
}

const [H, W] = lines[0].trim().split(/\s+/).map(Number);
const grid = lines.slice(1, H + 1).map(line => line.trim());

let startRow = -1, startCol = -1;
for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    if (grid[r][c] === 'S') {
      startRow = r;
      startCol = c;
      break;
    }
  }
  if (startRow !== -1) break;
}

if (startRow === -1) {
  console.log(-1);
  process.exit(0);
}

const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
const entries = [];

class Entry {
  constructor(cost: number, row: number, col: number) {
    this.cost = cost;
    this.row = row;
    this.col = col;
  }
}

entries.push(new Entry(0, startRow, startCol));

function siftUp(array, index) {
  const length = array.length;
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (array[parent].cost <= array[index].cost) break;
    [array[parent], array[index]] = [array[index], array[parent]];
    index = parent;
  }
}

function siftDown(array, start) {
  let root = start;
  const length = array.length;
  while (true) {
    let child = 2 * root + 1;
    if (child >= length) break;
    if (child + 1 < length && array[child + 1].cost < array[child].cost) {
      child++;
    }
    if (array[child].cost < array[root].cost) {
      [array[child], array[root]] = [array[root], array[child]];
      root = child;
    } else {
      break;
    }
  }
}

const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

while (entries.length > 0) {
  const entry = entries[0];
  entries.shift();

  if (entry.cost > dist[entry.row][entry.col]) continue;

  if (entry.row === H - 1 && entry.col === W - 1 && grid[entry.row][entry.col] === 'T') {
    console.log(entry.cost);
    process.exit(0);
  }

  for (const [dr, dc] of directions) {
    const nr = entry.row + dr;
    const nc = entry.col + dc;

    if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
      let costToEnter = 0;
      if (grid[nr][nc] >= '0' && grid[nr][nc] <= '9') {
        costToEnter = parseInt(grid[nr][nc], 10);
      } else if (grid[nr][nc] === 'T') {
        costToEnter = 0;
      }

      const newCost = entry.cost + costToEnter;
      if (newCost < dist[nr][nc]) {
        dist[nr][nc] = newCost;
        entries.push(new Entry(newCost, nr, nc));
        siftUp(entries, entries.length - 1);
      }
    }
  }
}

console.log(-1);
