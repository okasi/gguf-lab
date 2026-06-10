const path = require('path');
const fs = require('fs');

// Read input from the first argument
const input = fs.readFileSync(0, 'utf8').toString().trim().split('\n');

// Constants for cell types
const WALL = '#';
const START = 'S';
const TARGET = 'T';

// Dijkstra's algorithm
class Dijkstra {
  static solve(grid: string[], start: [number, number], target: [number, number]): number {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const height = grid.length;
    const width = grid[0].length;
    const costs = Array.from({ length: height }, () => Array.from({ length: width }, () => Infinity));
    const visited = Array.from({ length: height }, () => Array.from({ length: width }, () => false));

    const queue = new PriorityQueue();
    queue.enqueue(start, 0);

    while (!queue.isEmpty()) {
      const [x, y] = queue.dequeue();

      if (visited[y][x]) continue;
      visited[y][x] = true;

      if (grid[y][x] === TARGET) return costs[y][x];

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        if (visited[ny][nx] || grid[ny][nx] === WALL) continue;

        const cost = costs[y][x] + (grid[ny][nx] === START || grid[ny][nx] === TARGET ? 0 : parseInt(grid[ny][nx]));
        if (cost < costs[ny][nx]) {
          costs[ny][nx] = cost;
          queue.enqueue([nx, ny], cost);
        }
      }
    }

    return -1;
  }
}

// Priority queue
class PriorityQueue {
  private data: { element: [number, number], priority: number }[] = [];

  enqueue(element: [number, number], priority: number): void {
    this.data.push({ element, priority });
    this.data.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): [number, number] {
    return this.data.shift().element;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }
}

// Parse input
const height = parseInt(input[0].split(' ')[0]);
const width = parseInt(input[0].split(' ')[1]);
const grid = input.slice(1, height + 1);

// Find start and target
const start: [number, number] = [0, 0];
const target: [number, number] = [0, 0];
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (grid[y][x] === START) {
      start[0] = x;
      start[1] = y;
    } else if (grid[y][x] === TARGET) {
      target[0] = x;
      target[1] = y;
    }
  }
}

// Solve
console.log(Dijkstra.solve(grid, start, target));
