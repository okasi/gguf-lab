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
    constructor() {
        this.heap = [];
    }
    push(val) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    bubbleUp(i) {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.heap[parent][0] <= this.heap[i][0])
                break;
            [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
            i = parent;
        }
    }
    sinkDown(i) {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.heap[left][0] < this.heap[smallest][0]) {
                smallest = left;
            }
            if (right < n && this.heap[right][0] < this.heap[smallest][0]) {
                smallest = right;
            }
            if (smallest === i)
                break;
            [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
            i = smallest;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    const firstLine = lines[0].trim().split(/\s+/);
    const H = parseInt(firstLine[0], 10);
    const W = parseInt(firstLine[1], 10);
    const grid = [];
    let startX = -1, startY = -1;
    let targetX = -1, targetY = -1;
    for (let i = 0; i < H; i++) {
        grid.push(lines[i + 1]);
        for (let j = 0; j < W; j++) {
            const char = grid[i][j];
            if (char === "S") {
                startX = i;
                startY = j;
            }
            else if (char === "T") {
                targetX = i;
                targetY = j;
            }
        }
    }
    const dist = Array(H).fill(null).map(() => Array(W).fill(Infinity));
    dist[startX][startY] = 0;
    const pq = new MinHeap();
    pq.push([0, startX, startY]);
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (!pq.isEmpty()) {
        const current = pq.pop();
        const [cost, x, y] = current;
        if (cost > dist[x][y])
            continue;
        if (x === targetX && y === targetY) {
            console.log(cost);
            return;
        }
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < H && ny >= 0 && ny < W) {
                const cell = grid[nx][ny];
                if (cell === "#")
                    continue;
                let addCost = 0;
                if (cell >= "0" && cell <= "9") {
                    addCost = parseInt(cell, 10);
                }
                const newCost = cost + addCost;
                if (newCost < dist[nx][ny]) {
                    dist[nx][ny] = newCost;
                    pq.push([newCost, nx, ny]);
                }
            }
        }
    }
    console.log(-1);
}
solve();
