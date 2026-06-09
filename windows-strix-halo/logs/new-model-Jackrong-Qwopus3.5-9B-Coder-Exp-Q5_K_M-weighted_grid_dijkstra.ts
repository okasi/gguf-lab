import * as fs from "fs";

interface Cell {
  r: number;
  c: number;
  cost: number;
}

function minCostPath(): number {
  const data = fs.readFileSync(0, "utf8");
  const lines = data.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length < 2) return -1;

  const [HStr, WStr, ...gridLines] = lines;
  const H = parseInt(HStr, 10);
  const W = parseInt(WStr, 10);

  if (H <= 0 || W <= 0) return -1;

  const grid: string[][] = [];
  for (let i = 0; i < H; i++) {
    grid.push(gridLines[i].split(""));
  }

  let start: Cell | null = null;
  let target: Cell | null = null;

  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const ch = grid[r][c];
      if (ch === "S") {
        start = { r, c, cost: 0 };
      } else if (ch === "T") {
        target = { r, c, cost: 0 };
      }
    }
  }

  if (!start || !target) return -1;

  const INF = Number.MAX_SAFE_INTEGER;
  const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(INF));
  dist[start.r][start.c] = 0;

  const pq: [number, Cell][] = [[0, start]];

  const dir: [number, number][] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  while (pq.length > 0) {
    let minCost = INF;
    let minIdx = -1;
    for (let i = 0; i < pq.length; i++) {
      if (pq[i][0] < minCost) {
        minCost = pq[i][0];
        minIdx = i;
      }
    }

    if (minIdx === -1) break;
    const [cost, { r: curR, c: curC }] = pq.splice(minIdx, 1)[0];

    if (curR === target.r && curC === target.c) {
      return cost;
    }

    if (cost > dist[curR][curC]) continue;

    for (const [dr, dc] of dir) {
      const nr = curR + dr;
      const nc = curC + dc;

      if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
      const ch = grid[nr][nc];
      if (ch === "#") continue;

      let cellCost = 0;
      if (ch >= "0" && ch <= "9") {
        cellCost = parseInt(ch, 10);
      }

      const newCost = cost + cellCost;
      if (newCost < dist[nr][nc]) {
        dist[nr][nc] = newCost;
        pq.push([newCost, { r: nr, c: nc, cost: cellCost }]);
      }
    }
  }

  return -1;
}

console.log(minCostPath());
