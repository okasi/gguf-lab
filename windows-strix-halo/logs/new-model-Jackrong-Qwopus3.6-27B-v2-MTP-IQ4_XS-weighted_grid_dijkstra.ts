import fs from "fs";

function main() {
  const data = fs.readFileSync(0, "utf8");
  const lines = data.trim().split("\n");
  const [H, W] = lines[0].split(" ").map(Number);
  const grid: string[] = [];
  let startY = -1, startX = -1, targetY = -1, targetX = -1;

  for (let i = 0; i < H; i++) {
    grid[i] = lines[i + 1];
    for (let j = 0; j < W; j++) {
      const ch = grid[i][j];
      if (ch === "S") {
        startY = i;
        startX = j;
      } else if (ch === "T") {
        targetY = i;
        targetX = j;
      }
    }
  }

  const dist: number[][] = new Array(H);
  for (let i = 0; i < H; i++) {
    dist[i] = new Array(W).fill(Infinity);
  }

  dist[startY][startX] = 0;

  const dx = [0, 0, 1, -1];
  const dy = [1, -1, 0, 0];

  const pq: [number, number, number][] = []; // [cost, y, x]
  pq.push([0, startY, startX]);

  while (pq.length > 0) {
    // Extract min - simple linear scan for correctness (Dijkstra)
    // For better performance, a binary heap could be used, but linear scan is fine for typical constraints
    let minIdx = 0;
    for (let i = 1; i < pq.length; i++) {
      if (pq[i][0] < pq[minIdx][0]) {
        minIdx = i;
      }
    }
    const [cost, y, x] = pq[minIdx];
    pq.splice(minIdx, 1);

    if (cost > dist[y][x]) continue;
    if (y === targetY && x === targetX) {
      console.log(cost);
      return;
    }

    for (let d = 0; d < 4; d++) {
      const ny = y + dy[d];
      const nx = x + dx[d];
      if (ny < 0 || ny >= H || nx < 0 || nx >= W) continue;
      const ch = grid[ny][nx];
      if (ch === "#") continue;
      let newCost = cost;
      if (ch !== "S" && ch !== "T") {
        newCost += parseInt(ch, 10);
      }
      if (newCost < dist[ny][nx]) {
        dist[ny][nx] = newCost;
        pq.push([newCost, ny, nx]);
      }
    }
  }

  console.log(-1);
}

main();
