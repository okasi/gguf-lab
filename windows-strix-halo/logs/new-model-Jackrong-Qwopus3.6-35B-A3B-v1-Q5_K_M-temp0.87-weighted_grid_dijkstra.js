"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class MinPQ {
    constructor() {
        this.heap = [];
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0 && end) {
            this.heap[0] = end;
            this.sinkDown(0);
        }
        return min;
    }
    get size() {
        return this.heap.length;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex][0] <= this.heap[index][0])
                break;
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }
    sinkDown(index) {
        const n = this.heap.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < n && this.heap[left][0] < this.heap[smallest][0])
                smallest = left;
            if (right < n && this.heap[right][0] < this.heap[smallest][0])
                smallest = right;
            if (smallest === index)
                break;
            [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
            index = smallest;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [H, W] = lines[0].trim().split(" ").map(Number);
    const grid = [];
    let start = null;
    let target = null;
    for (let i = 0; i < H; i++) {
        grid.push(lines[i + 1].trim().split(""));
    }
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            if (grid[i][j] === "S")
                start = [i, j];
            if (grid[i][j] === "T")
                target = [i, j];
        }
    }
    if (!start || !target) {
        console.log(-1);
        return;
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[start[0]][start[1]] = 0;
    const pq = new MinPQ();
    pq.push([0, start[0], start[1]]);
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (pq.size > 0) {
        const [cost, r, c] = pq.pop();
        if (r === target[0] && c === target[1]) {
            console.log(cost);
            return;
        }
        if (cost > dist[r][c])
            continue;
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== "#") {
                const cell = grid[nr][nc];
                const moveCost = (cell === "S" || cell === "T") ? 0 : Number(cell);
                if (cost + moveCost < dist[nr][nc]) {
                    dist[nr][nc] = cost + moveCost;
                    pq.push([dist[nr][nc], nr, nc]);
                }
            }
        }
    }
    console.log(-1);
}
solve();
