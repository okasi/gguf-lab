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
        this.data = [];
    }
    push(node) {
        this.data.push(node);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        if (this.data.length === 1)
            return this.data.pop();
        const top = this.data[0];
        this.data[0] = this.data.pop();
        this.siftDown(0);
        return top;
    }
    get size() {
        return this.data.length;
    }
    siftUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[parentIndex][0] <= this.data[index][0])
                break;
            this.swap(parentIndex, index);
            index = parentIndex;
        }
    }
    siftDown(index) {
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < this.data.length && this.data[left][0] < this.data[smallest][0])
                smallest = left;
            if (right < this.data.length && this.data[right][0] < this.data[smallest][0])
                smallest = right;
            if (smallest === index)
                break;
            this.swap(smallest, index);
            index = smallest;
        }
    }
    swap(i, j) {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const lines = input.split("\n");
    const firstLine = lines[0].trim();
    const [H, W] = firstLine.split(/\s+/).map(Number);
    const grid = [];
    let sy = -1, sx = -1;
    for (let i = 0; i < H; i++) {
        const row = lines[i + 1].trim();
        grid.push(row.split(""));
        for (let j = 0; j < W; j++) {
            if (grid[i][j] === "S") {
                sy = i;
                sx = j;
            }
        }
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[sy][sx] = 0;
    const pq = new MinHeap();
    pq.push([0, sy, sx]);
    const dx = [0, 1, 0, -1];
    const dy = [1, 0, -1, 0];
    while (pq.size > 0) {
        const item = pq.pop();
        if (!item)
            continue;
        const [d, y, x] = item;
        if (d > dist[y][x])
            continue;
        if (grid[y][x] === "T") {
            console.log(d);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nx = x + dx[i];
            const ny = y + dy[i];
            if (nx < 0 || nx >= W || ny < 0 || ny >= H)
                continue;
            const cell = grid[ny][nx];
            if (cell === "#")
                continue;
            const cost = cell === "T" ? 0 : cell === "S" ? 0 : parseInt(cell);
            const newD = d + cost;
            if (newD < dist[ny][nx]) {
                dist[ny][nx] = newD;
                pq.push([newD, ny, nx]);
            }
        }
    }
    console.log("-1");
}
solve();
