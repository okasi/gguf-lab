"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function solve() {
    const input = fs_1.default.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [HStr, WStr] = lines[0].split(" ");
    const H = parseInt(HStr);
    const W = parseInt(WStr);
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(lines[i]);
    }
    let startX = -1;
    let startY = -1;
    let endX = -1;
    let endY = -1;
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const ch = grid[y][x];
            if (ch === 'S') {
                startX = x;
                startY = y;
            }
            else if (ch === 'T') {
                endX = x;
                endY = y;
            }
        }
    }
    const INF = Number.MAX_SAFE_INTEGER;
    const dist = Array.from({ length: H }, () => Array(W).fill(INF));
    dist[startY][startX] = 0;
    const pq = [];
    const push = (cost, x, y) => {
        pq.push({ cost, x, y });
    };
    const pop = () => {
        if (pq.length === 0)
            return undefined;
        let minIdx = 0;
        for (let i = 1; i < pq.length; i++) {
            if (pq[i].cost < pq[minIdx].cost) {
                minIdx = i;
            }
        }
        const item = pq[minIdx];
        pq[minIdx] = pq[pq.length - 1];
        pq.pop();
        return item;
    };
    push(0, startX, startY);
    const dx = [0, 0, -1, 1];
    const dy = [-1, 1, 0, 0];
    while (pq.length > 0) {
        const curr = pop();
        if (!curr)
            break;
        const { cost, x, y } = curr;
        if (cost > dist[y][x])
            continue;
        if (x === endX && y === endY) {
            console.log(cost);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nx = x + dx[i];
            const ny = y + dy[i];
            if (nx < 0 || nx >= W || ny < 0 || ny >= H)
                continue;
            const cell = grid[ny][nx];
            if (cell === '#')
                continue;
            let weight = 0;
            if (cell >= '0' && cell <= '9') {
                weight = parseInt(cell);
            }
            const newCost = cost + weight;
            if (newCost < dist[ny][nx]) {
                dist[ny][nx] = newCost;
                push(newCost, nx, ny);
            }
        }
    }
    console.log(-1);
}
solve();
