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
    push(state) {
        this.heap.push(state);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return null;
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.heap[i].cost < this.heap[parent].cost) {
                [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
                i = parent;
            }
            else {
                break;
            }
        }
    }
    bubbleDown(i) {
        const length = this.heap.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < length && this.heap[left].cost < this.heap[smallest].cost) {
                smallest = left;
            }
            if (right < length && this.heap[right].cost < this.heap[smallest].cost) {
                smallest = right;
            }
            if (smallest !== i) {
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
                i = smallest;
            }
            else {
                break;
            }
        }
    }
}
const input = fs.readFileSync(0, 'utf8');
const lines = input.trim().split(/\r?\n/);
if (lines.length === 0) {
    console.log(-1);
    process.exit(0);
}
const firstLineParts = lines[0].trim().split(/\s+/);
const H = parseInt(firstLineParts[0]);
const W = parseInt(firstLineParts[1]);
const grid = lines.slice(1, H + 1).map(row => row.trim().split(''));
let startR = -1;
let startC = -1;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (grid[r] && c < grid[r].length) {
            if (grid[r][c] === 'S') {
                startR = r;
                startC = c;
            }
        }
    }
}
if (startR === -1) {
    console.log(-1);
    process.exit(0);
}
const dist = Array(H).fill(Infinity).map(() => Array(W).fill(Infinity));
const pq = new MinHeap();
pq.push({ cost: 0, r: startR, c: startC });
dist[startR][startC] = 0;
const directions = [
    [0, 1], [0, -1], [1, 0], [-1, 0]
];
while (!pq.isEmpty()) {
    const state = pq.pop();
    if (!state)
        break;
    if (state.cost > dist[state.r][state.c])
        continue;
    if (grid[state.r] && state.c < grid[state.r].length && grid[state.r][state.c] === 'T') {
        console.log(state.cost);
        process.exit(0);
    }
    for (const [dr, dc] of directions) {
        const nr = state.r + dr;
        const nc = state.c + dc;
        if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
            if (grid[nr] && nc < grid[nr].length) {
                const cell = grid[nr][nc];
                if (cell === '#')
                    continue;
                const cost = cell === 'S' || cell === 'T' ? 0 : parseInt(cell);
                const newCost = state.cost + cost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.push({ cost: newCost, r: nr, c: nc });
                }
            }
        }
    }
}
console.log(-1);
