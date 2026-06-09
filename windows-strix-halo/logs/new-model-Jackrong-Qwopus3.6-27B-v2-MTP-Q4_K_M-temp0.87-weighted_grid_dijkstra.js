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
        this.items = [];
        this.compare = compare;
    }
    push(item) {
        this.items.push(item);
        this.siftUp(this.items.length - 1);
    }
    pop() {
        if (this.items.length === 0)
            return undefined;
        const top = this.items[0];
        const last = this.items.pop();
        if (this.items.length > 0) {
            this.items[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    peek() {
        return this.items[0];
    }
    isEmpty() {
        return this.items.length === 0;
    }
    size() {
        return this.items.length;
    }
    siftUp(index) {
        const item = this.items[index];
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.compare(item, this.items[parentIndex]) < 0) {
                this.items[index] = this.items[parentIndex];
                index = parentIndex;
            }
            else {
                break;
            }
        }
        this.items[index] = item;
    }
    siftDown(index) {
        const item = this.items[index];
        const halfLength = this.items.length >> 1;
        while (index < halfLength) {
            let leftChild = (index << 1) + 1;
            let rightChild = leftChild + 1;
            let smallest = leftChild;
            if (rightChild < this.items.length && this.compare(this.items[rightChild], this.items[leftChild]) < 0) {
                smallest = rightChild;
            }
            if (this.compare(item, this.items[smallest]) <= 0) {
                break;
            }
            this.items[index] = this.items[smallest];
            index = smallest;
        }
        this.items[index] = item;
    }
}
const data = fs.readFileSync(0, 'utf8').trim();
const lines = data.split(/\r?\n/);
const firstLine = lines[0].trim().split(/\s+/).map(Number);
const H = firstLine[0];
const W = firstLine[1];
const grid = lines.slice(1, H + 1).map(line => line.trim());
let sr = -1, sc = -1, tr = -1, tc = -1;
for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
        const ch = grid[i][j];
        if (ch === 'S') {
            sr = i;
            sc = j;
        }
        else if (ch === 'T') {
            tr = i;
            tc = j;
        }
    }
}
const dist = Array.from({ length: H }, () => new Array(W).fill(Infinity));
dist[sr][sc] = 0;
const heap = new MinHeap((a, b) => a.cost - b.cost);
heap.push({ cost: 0, r: sr, c: sc });
const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
while (!heap.isEmpty()) {
    const { cost: d, r, c } = heap.pop();
    if (d > dist[r][c])
        continue;
    if (r === tr && c === tc) {
        console.log(d);
        process.exit(0);
    }
    for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= H || nc < 0 || nc >= W)
            continue;
        const ch = grid[nr][nc];
        if (ch === '#')
            continue;
        let enterCost = 0;
        if (ch >= '0' && ch <= '9') {
            enterCost = parseInt(ch);
        }
        else if (ch === 'T' || ch === 'S') {
            enterCost = 0;
        }
        else {
            enterCost = 0;
        }
        const newDist = d + enterCost;
        if (newDist < dist[nr][nc]) {
            dist[nr][nc] = newDist;
            heap.push({ cost: newDist, r: nr, c: nc });
        }
    }
}
if (dist[tr][tc] !== Infinity) {
    console.log(dist[tr][tc]);
}
else {
    console.log(-1);
}
