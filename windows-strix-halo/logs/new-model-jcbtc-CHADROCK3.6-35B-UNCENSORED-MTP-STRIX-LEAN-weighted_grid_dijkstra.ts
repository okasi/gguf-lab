import fs from "fs";

function solve(): void {
  const input = fs.readFileSync(0, "utf8").trim().split("\n");
  const [H, W] = input[0].split(" ").map(Number);
  const grid: string[][] = [];
  let start: [number, number] | null = null;
  let target: [number, number] | null = null;

  for (let i = 1; i <= H; i++) {
    grid.push(input[i].split(""));
  }

  // Find start and target
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (grid[r][c] === "S") {
        start = [r, c];
      } else if (grid[r][c] === "T") {
        target = [r, c];
      }
    }
  }

  if (!start || !target) {
    console.log("-1");
    return;
  }

  const [sr, sc] = start;
  const [tr, tc] = target;

  // Dijkstra's algorithm
  const dist: number[][] = Array.from({ length: H }, () =>
    Array(W).fill(Infinity)
  );
  dist[sr][sc] = 0;

  const pq: [number, number, number][] = [[0, sr, sc]];

  const dirs = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  while (pq.length > 0) {
    // Extract min
    pq.sort((a, b) => a[0] - b[0]);
    const [d, r, c] = pq.shift()!;

    if (d > dist[r][c]) continue;

    if (r === tr && c === tc) {
      console.log(d);
      return;
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== "#") {
        let cost = 0;
        const cell = grid[nr][nc];
        if (cell !== "S" && cell !== "T") {
          cost = parseInt(cell, 10);
        }

        const newDist = d + cost;
        if (newDist < dist[nr][nc]) {
          dist[nr][nc] = newDist;
          pq.push([newDist, nr, nc]);
        }
      }
    }
  }

  console.log("-1");
}

solve();
