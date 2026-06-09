function parseGrid(input: string): { grid: string[], start: [number, number], H: number, W: number } {
  const lines = input.trim().split('\n');
  const H = parseInt(lines[0]);
  const W = parseInt(lines[1]);
  const grid = lines.slice(2).map(line => line.trim());
  let start: [number, number] = [0, 0];

  for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
      if (grid[i][j] === 'S') {
        start = [i, j];
      }
    }
  }

  return { grid, start, H, W };
}

function dijkstra(grid: string[], start: [number, number], H: number, W: number): number {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
  const visited: boolean[][] = Array.from({ length: H }, () => Array(W).fill(false));

  dist[start[0]][start[1]] = 0;
  const pq: [number, number, number][] = [[0, start[0], start[1]]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [cost, x, y] = pq.shift()!;

    if (visited[x][y]) continue;
    visited[x][y] = true;

    if (grid[x][y] === 'T') return cost;

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < H && ny >= 0 && ny < W && !visited[nx][ny] && grid[nx][ny] !== '#') {
        const newCost = cost + (grid[nx][ny] === '.' || grid[nx][ny] === 'S' || grid[nx][ny] === 'T' ? 0 : parseInt(grid[nx][ny]));
        if (newCost < dist[nx][ny]) {
          dist[nx][ny] = newCost;
          pq.push([newCost, nx, ny]);
        }
      }
    }
  }

  return -1;
}

function solve(input: string): number {
  const { grid, start, H, W } = parseGrid(input);
  return dijkstra(grid, start, H, W);
}

const input = require('fs').readFileSync(0, 'utf8');
console.log(solve(input));
