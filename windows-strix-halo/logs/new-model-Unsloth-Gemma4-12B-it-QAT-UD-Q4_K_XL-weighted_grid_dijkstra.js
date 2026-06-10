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
function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\r?\n/);
    if (input.length === 0)
        return;
    const firstLine = input[0].trim().split(/\s+/);
    if (firstLine.length < 2)
        return;
    const H = parseInt(firstLine[0]);
    const W = parseInt(firstLine[1]);
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].trim().split(/(\s+)/).filter(x => x !== ""));
    }
    // The grid might have extra whitespace due to split. 
    // Let's clean it to ensure it's a 2D array of chars.
    const cleanGrid = [];
    for (let i = 0; i < H; i++) {
        let row = [];
        // The split above might be messy depending on input format, 
        // but usually, we want the actual characters.
        // Let's re-process to be safe based on the "H lines" description.
        const rawLine = input[i + 1].trim();
        for (let char of rawLine) {
            if (char !== ' ')
                row.push(char);
        }
        cleanGrid.push(row);
    }
    let start = [-1, -1];
    let target = [-1, -1];
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (cleanGrid[r][c] === 'S')
                start = [r, c];
            if (cleanGrid[r][c] === 'T')
                target = [r, c];
        }
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    // Min-Priority Queue Implementation (Simple Binary Heap)
    class PriorityQueue {
        constructor() {
            this.heap = [];
        }
        push(cost, r, c) {
            this.heap.push({ cost, r, c });
            this.bubbleUp();
        }
        pop() {
            if (this.size() === 0)
                return null;
            const top = this.heap[0];
            const last = this.heap.pop();
            if (this.size() > 0) {
                this.heap[0] = last;
                this.bubbleDown();
            }
            return top;
        }
        size() { return this.heap.length; }
        bubbleUp() {
            let idx = this.heap.length - 1;
            while (idx > 0) {
                let parentIdx = Math.floor((idx - 1) / 2);
                if (this.heap[idx].cost < this.heap[parentIdx].cost) {
                    [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                    idx = parentIdx;
                }
                else
                    break;
            }
        }
        bubbleDown() {
            let idx = 0;
            while (true) {
                let left = 2 * idx + 1;
                let right = 2 * idx + 2;
                let smallest = idx;
                if (left < this.heap.length && this.heap[left].cost < this.heap[smallest].cost)
                    smallest = left;
                if (right < this.heap.length && this.heap[right].cost < this.heap[smallest].cost)
                    smallest = right;
                if (smallest !== idx) {
                    [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                    idx = smallest;
                }
                else
                    break;
            }
        }
    }
    const pq = new PriorityQueue();
    dist[start[0]][start[1]] = 0;
    pq.push(0, start[0], start[1]);
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    while (pq.size() > 0) {
        const { cost, r, c } = pq.pop();
        if (cost > dist[r][c])
            continue;
        if (r === target[0] && c === target[1]) {
            console.log(cost);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = cleanGrid[nr][nc];
                if (char === '#')
                    continue;
                let moveCost = 0;
                if (char >= '0' && char <= '9') {
                    moveCost = parseInt(char);
                }
                if (dist[r][c] + moveCost < dist[nr][nc]) {
                    dist[nr][nc] = dist[r][c] + moveCost;
                    pq.push(dist[nr][nc], nr, nc);
                }
            }
        }
    }
    console.log(-1);
}
solve();
