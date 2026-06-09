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
    push(priority, value) {
        this.heap.push({ priority, value });
        this.bubbleUp();
    }
    pop() {
        if (this.size() === 0)
            return undefined;
        if (this.size() === 1)
            return this.heap.pop().value;
        const top = this.heap[0].value;
        this.heap[0] = this.heap.pop();
        this.bubbleDown();
        return top;
    }
    size() {
        return this.heap.length;
    }
    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].priority <= this.heap[index].priority)
                break;
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }
    bubbleDown() {
        let index = 0;
        const length = this.heap.length;
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let swap = null;
            if (left < length) {
                if (this.heap[left].priority < this.heap[index].priority) {
                    swap = left;
                }
            }
            if (right < length) {
                if ((swap === null && this.heap[right].priority < this.heap[index].priority) ||
                    (swap !== null && this.heap[right].priority < this.heap[left].priority)) {
                    swap = right;
                }
            }
            if (swap === null)
                break;
            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
            index = swap;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    if (input.length < 2)
        return;
    const H = parseInt(input[0]);
    const W = parseInt(input[1]);
    const grid = [];
    let startPos = [-1, -1];
    let targetPos = [-1, -1];
    let currentIdx = 2;
    for (let i = 0; i < H; i++) {
        const rowStr = input[currentIdx++];
        const row = rowStr.split('');
        grid.push(row);
        for (let j = 0; j < W; j++) {
            if (row[j] === 'S')
                startPos = [i, j];
            if (row[j] === 'T')
                targetPos = [i, j];
        }
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const pq = new MinHeap();
    dist[startPos[0]][startPos[1]] = 0;
    pq.push(0, { r: startPos[0], c: startPos[1], cost: 0 });
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    let minCost = -1;
    while (pq.size() > 0) {
        const current = pq.pop();
        const { r, c, cost } = current;
        if (cost > dist[r][c])
            continue;
        if (r === targetPos[0] && c === targetPos[1]) {
            minCost = cost;
            break;
        }
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char === '#')
                    continue;
                let moveCost = 0;
                if (char >= '0' && char <= '9') {
                    moveCost = parseInt(char);
                }
                if (dist[r][c] + moveCost < dist[nr][nc]) {
                    dist[nr][nc] = dist[r][c] + moveCost;
                    pq.push(dist[nr][nc], { r: nr, c: nc, cost: dist[nr][nc] });
                }
            }
        }
    }
    console.log(minCost);
}
solve();
