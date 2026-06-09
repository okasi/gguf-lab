import { readFileSync } from "fs";

const input = readFileSync(0, "utf8").trimEnd();
const lines = input.split("\n");
const [H, W] = lines[0].split(" ").map(Number);

const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
const visited: boolean[][] = Array.from({ length: H }, () => Array(W).fill(false));

let startX = -1, startY = -1;
let targetX = -1, targetY = -1;

const parseCost = (c: string): number | null => {
  if (c === 'S') return 0;
  if (c === 'T') return 0;
  if (c === '#') return -1;
  const n = parseInt(c, 10);
  if (!isNaN(n) && n >= 0 && n <= 9) return n;
  return -1;
};

const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

for (let i = 0; i < H; i++) {
  for (let j = 0; j < W; j++) {
    const c = lines[i][j];
    if (c === 'S') {
      startX = i;
      startY = j;
      dist[i][j] = 0;
    } else if (c === 'T') {
      targetX = i;
      targetY = j;
    }
  }
}

const heap: [number, number, number][] = []; // [cost, x, y]
const pushHeap = (cost: number, x: number, y: number) => {
  heap.push([cost, x, y]);
  let idx = heap.length - 1;
  while (idx > 0) {
    const parent = (idx - 1) >> 1;
    if (heap[parent][0] > heap[idx][0]) {
      [heap[parent], heap[idx]] = [heap[idx], heap[parent]];
      idx = parent;
    } else {
      break;
    }
  }
};

const popHeap = (): [number, number, number] | null => {
  if (heap.length === 0) return null;
  const top = heap[0];
  const last = heap.pop()!;
  if (heap.length > 0) {
    heap[0] = last;
    let idx = 0;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < heap.length && heap[left][0] < heap[smallest][0]) {
        smallest = left;
      }
      if (right < heap.length && heap[right][0] < heap[smallest][0]) {
        smallest = right;
      }
      if (smallest !== idx) {
        [heap[idx], heap[smallest]] = [heap[smallest], heap[idx]];
        idx = smallest;
      } else {
        break;
      }
    }
  }
  return top;
};

pushHeap(0, startX, startY);

while (heap.length > 0) {
  const [d, x, y] = popHeap()!;
  if (visited[x][y]) continue;
  visited[x][y] = true;

  if (x === targetX && y === targetY) {
    console.log(d);
    process.exit(0);
  }

  for (const [dx, dy] of dirs) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < H && ny >= 0 && ny < W && !visited[nx][ny]) {
      const c = lines[nx][ny];
      if (c !== '#') {
        const cost = parseCost(c);
        if (cost !== null && cost >= 0) {
          const newDist = d + cost;
          if (newDist < dist[nx][ny]) {
            dist[nx][ny] = newDist;
            pushHeap(newDist, nx, ny);
          }
        }
      }
    }
  }
}

console.log(-1);
