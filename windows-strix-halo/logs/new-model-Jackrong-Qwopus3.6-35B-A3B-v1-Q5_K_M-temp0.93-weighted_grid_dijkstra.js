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
class MinHeap {
    constructor(compare) {
        this.data = [];
        this.compare = compare;
    }
    push(item) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        const top = this.data[0];
        const end = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = end;
            this.sinkDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    bubbleUp(i) {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.compare(this.data[i], this.data[parent]) < 0) {
                [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
                i = parent;
            }
            else {
                break;
            }
        }
    }
    sinkDown(i) {
        const n = this.data.length;
        while (true) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let smallest = i;
            if (left < n && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < n && this.compare(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }
            if (smallest !== i) {
                [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
                i = smallest;
            }
            else {
                break;
            }
        }
    }
}
const main = () => {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const lines = input.split('\n');
    const [H, W] = lines[0].split(' ').map(Number);
    const grid = [];
    let startRow = -1, startCol = -1;
    let targetRow = -1, targetCol = -1;
    for (let i = 0; i < H; i++) {
        const row = lines[i + 1].split('');
        grid.push(row);
        for (let j = 0; j < W; j++) {
            if (row[j] === 'S') {
                startRow = i;
                startCol = j;
            }
            else if (row[j] === 'T') {
                targetRow = i;
                targetCol = j;
            }
        }
    }
    const INF = Number.MAX_SAFE_INTEGER;
    const dist = Array.from({ length: H }, () => Array(W).fill(INF));
    dist[startRow][startCol] = 0;
    const pq = new MinHeap((a, b) => a[0] - b[0]);
    pq.push([0, startRow, startCol]);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (!pq.isEmpty()) {
        const [cost, r, c] = pq.pop();
        if (r === targetRow && c === targetCol) {
            console.log(cost);
            return;
        }
        if (cost > dist[r][c]) {
            continue;
        }
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const cell = grid[nr][nc];
            if (cell === '#')
                continue;
            const enterCost = (cell === 'S' || cell === 'T') ? 0 : parseInt(cell, 10);
            const newCost = cost + enterCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.push([newCost, nr, nc]);
            }
        }
    }
    console.log(-1);
};
main();
