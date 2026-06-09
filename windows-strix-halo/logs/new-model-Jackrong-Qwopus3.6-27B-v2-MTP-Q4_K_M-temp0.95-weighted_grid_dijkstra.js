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
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    bubbleUp(idx) {
        const heap = this.heap;
        const item = heap[idx];
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (item[0] >= heap[parent][0])
                break;
            heap[idx] = heap[parent];
            idx = parent;
        }
        heap[idx] = item;
    }
    bubbleDown(idx) {
        const heap = this.heap;
        const half = heap.length >> 1;
        const item = heap[idx];
        while (idx < half) {
            const left = (idx << 1) + 1;
            const right = left + 1;
            let smallest = left;
            if (right < heap.length && heap[right][0] < heap[left][0]) {
                smallest = right;
            }
            if (heap[smallest][0] >= item[0])
                break;
            heap[idx] = heap[smallest];
            idx = smallest;
        }
        heap[idx] = item;
    }
}
function main() {
    const data = fs.readFileSync(0, 'utf8').trim();
    const lines = data.split(/\r?\n/);
    const firstLine = lines[0].trim().split(/\s+/);
    const H = parseInt(firstLine[0], 10);
    const W = parseInt(firstLine[1], 10);
    const cellCost = new Array(H);
    let startX = 0, startY = 0, targetX = 0, targetY = 0;
    for (let i = 0; i < H; i++) {
        const row = lines[i + 1].trim();
        cellCost[i] = new Array(W);
        for (let j = 0; j < W; j++) {
            const ch = row[j];
            if (ch === '#') {
                cellCost[i][j] = -1;
            }
            else if (ch === 'S') {
                cellCost[i][j] = 0;
                startX = i;
                startY = j;
            }
            else if (ch === 'T') {
                cellCost[i][j] = 0;
                targetX = i;
                targetY = j;
            }
            else if (ch >= '0' && ch <= '9') {
                cellCost[i][j] = parseInt(ch, 10);
            }
            else {
                // Unexpected character, treat as wall
                cellCost[i][j] = -1;
            }
        }
    }
    const dist = new Array(H);
    for (let i = 0; i < H; i++) {
        dist[i] = new Array(W).fill(Infinity);
    }
    dist[startX][startY] = 0;
    const pq = new MinHeap();
    pq.push([0, startX, startY]);
    const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];
    while (!pq.isEmpty()) {
        const [cost, x, y] = pq.pop();
        if (cost > dist[x][y])
            continue;
        if (x === targetX && y === targetY) {
            console.log(cost);
            return;
        }
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < H && ny >= 0 && ny < W && cellCost[nx][ny] !== -1) {
                const newCost = cost + cellCost[nx][ny];
                if (newCost < dist[nx][ny]) {
                    dist[nx][ny] = newCost;
                    pq.push([newCost, nx, ny]);
                }
            }
        }
    }
    // unreachable
    console.log(-1);
}
main();
