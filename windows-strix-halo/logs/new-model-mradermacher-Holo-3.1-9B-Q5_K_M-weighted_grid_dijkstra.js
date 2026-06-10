"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const pq_1 = require("../pq");
function dijkstra(h, w, grid) {
    const start = findStart(grid);
    if (!start)
        return -1;
    const target = findTarget(grid);
    if (!target)
        return -1;
    const pq = new pq_1.PriorityQueue((a, b) => a.cost - b.cost);
    const visited = Array(h).fill(0).map(() => Array(w).fill(false));
    pq.enqueue({ x: start.x, y: start.y, cost: 0 });
    const dx = [-1, 1, 0, 0];
    const dy = [0, 0, -1, 1];
    while (pq.size() > 0) {
        const { x, y, cost } = pq.dequeue();
        if (x === target.x && y === target.y) {
            return cost;
        }
        if (visited[x][y])
            continue;
        visited[x][y] = true;
        for (let i = 0; i < 4; i++) {
            const nx = x + dx[i];
            const ny = y + dy[i];
            if (nx >= 0 && nx < h && ny >= 0 && ny < w && !visited[nx][ny]) {
                const cell = grid[nx][ny];
                let newCost = cost;
                if (cell !== '#' && cell !== 'S' && cell !== 'T') {
                    newCost += parseInt(cell);
                }
                pq.enqueue({ x: nx, y: ny, cost: newCost });
            }
        }
    }
    return -1;
}
function findStart(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === 'S') {
                return { x: i, y: j };
            }
        }
    }
    return null;
}
function findTarget(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === 'T') {
                return { x: i, y: j };
            }
        }
    }
    return null;
}
const stdin = fs_1.default.readFileSync(0, 'utf8').trim();
const [h, w] = stdin.split(' ').map(Number);
const grid = stdin
    .split('\n')
    .map(row => row.padEnd(w));
console.log(dijkstra(h, w, grid));
