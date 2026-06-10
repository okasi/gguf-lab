"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function solve() {
    const data = fs_1.default.readFileSync(0, "utf8").trim();
    const lines = data.split("\n");
    const [H, W] = lines[0].split(" ").map(Number);
    const grid = [];
    let startR = -1, startC = -1, targetR = -1, targetC = -1;
    for (let r = 0; r < H; r++) {
        grid.push(lines[r + 1].split(""));
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === "S") {
                startR = r;
                startC = c;
            }
            else if (grid[r][c] === "T") {
                targetR = r;
                targetC = c;
            }
        }
    }
    // Dijkstra's algorithm
    // dist[r][c] = minimum cost to reach cell (r, c)
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    // Priority queue using a simple array-based min-heap
    // Each element: [cost, r, c]
    const heap = [[0, startR, startC]];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    function heapPush(item) {
        heap.push(item);
        let i = heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (heap[parent][0] <= heap[i][0])
                break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    }
    function heapPop() {
        if (heap.length === 0)
            return undefined;
        const top = heap[0];
        const last = heap.pop();
        if (heap.length > 0) {
            heap[0] = last;
            let i = 0;
            while (true) {
                let smallest = i;
                const left = 2 * i + 1;
                const right = 2 * i + 2;
                if (left < heap.length && heap[left][0] < heap[smallest][0])
                    smallest = left;
                if (right < heap.length && heap[right][0] < heap[smallest][0])
                    smallest = right;
                if (smallest === i)
                    break;
                [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
                i = smallest;
            }
        }
        return top;
    }
    while (heap.length > 0) {
        const [cost, r, c] = heapPop();
        if (cost > dist[r][c])
            continue;
        if (r === targetR && c === targetC) {
            console.log(cost);
            return;
        }
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const cell = grid[nr][nc];
            if (cell === "#")
                continue;
            let newCost = cost;
            if (cell >= "0" && cell <= "9") {
                newCost = cost + (cell.charCodeAt(0) - 48);
            }
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                heapPush([newCost, nr, nc]);
            }
        }
    }
    console.log(-1);
}
solve();
