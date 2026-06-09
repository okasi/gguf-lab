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
const input = fs.readFileSync(0, 'utf8').trim().split('\n');
const [H, W] = input[0].split(' ').map(Number);
const grid = [];
for (let i = 1; i <= H; i++) {
    grid.push(input[i].split(''));
}
// locate S and T
let sR = -1, sC = -1, tR = -1, tC = -1;
for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (grid[r][c] === 'S') {
            sR = r;
            sC = c;
        }
        else if (grid[r][c] === 'T') {
            tR = r;
            tC = c;
        }
    }
}
// cost to enter cell
const cost = [];
for (let r = 0; r < H; r++) {
    const row = [];
    for (let c = 0; c < W; c++) {
        const ch = grid[r][c];
        if (ch === '#') {
            row.push(Infinity); // blocked
        }
        else if (ch >= '0' && ch <= '9') {
            row.push(parseInt(ch));
        }
        else { // S or T
            row.push(0);
        }
    }
    cost.push(row);
}
// Dijkstra
const dist = [];
for (let r = 0; r < H; r++) {
    dist.push(new Array(W).fill(Infinity));
}
dist[sR][sC] = 0;
// Min-heap
class MinHeap {
    constructor() {
        this.heap = [];
    }
    parent(i) { return Math.floor((i - 1) / 2); }
    left(i) { return 2 * i + 1; }
    right(i) { return 2 * i + 2; }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    bubbleUp(i) {
        while (i > 0 && this.heap[i][0] < this.heap[this.parent(i)][0]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }
    bubbleDown(i) {
        let size = this.heap.length;
        while (true) {
            let smallest = i;
            let l = this.left(i);
            let r = this.right(i);
            if (l < size && this.heap[l][0] < this.heap[smallest][0])
                smallest = l;
            if (r < size && this.heap[r][0] < this.heap[smallest][0])
                smallest = r;
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            }
            else {
                break;
            }
        }
    }
    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    peek() {
        return this.heap[0];
    }
    size() {
        return this.heap.length;
    }
}
const pq = new MinHeap();
pq.push([0, sR, sC]);
const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
while (pq.size() > 0) {
    const [d, r, c] = pq.pop();
    if (d > dist[r][c])
        continue; // stale
    if (r === tR && c === tC) {
        console.log(d);
        return; // exit
    }
    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= H || nc < 0 || nc >= W)
            continue;
        const cellCost = cost[nr][nc];
        if (cellCost === Infinity)
            continue; // wall
        const newDist = d + cellCost;
        if (newDist < dist[nr][nc]) {
            dist[nr][nc] = newDist;
            pq.push([newDist, nr, nc]);
        }
    }
}
console.log(-1);
