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
    parent(i) { return Math.floor((i - 1) / 2); }
    left(i) { return 2 * i + 1; }
    right(i) { return 2 * i + 2; }
    swap(i, j) {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }
    bubbleUp(i) {
        while (i > 0 && this.data[this.parent(i)][0] > this.data[i][0]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }
    sinkDown(i) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l][0] < this.data[smallest][0])
                smallest = l;
            if (r < n && this.data[r][0] < this.data[smallest][0])
                smallest = r;
            if (smallest === i)
                break;
            this.swap(smallest, i);
            i = smallest;
        }
    }
    push(item) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.sinkDown(0);
        }
        return top;
    }
    empty() {
        return this.data.length === 0;
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split('\n');
    if (lines.length === 0)
        return;
    const [H, W] = lines[0].trim().split(' ').map(Number);
    const grid = lines.slice(1).map(l => l.trim());
    let startX = -1, startY = -1;
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (grid[y][x] === 'S') {
                startX = x;
                startY = y;
            }
        }
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startY][startX] = 0;
    const pq = new MinHeap();
    pq.push([0, startY, startX]);
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (!pq.empty()) {
        const [d, y, x] = pq.pop();
        if (d > dist[y][x])
            continue;
        if (grid[y][x] === 'T') {
            console.log(d);
            return;
        }
        for (const [dy, dx] of dirs) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny < 0 || ny >= H || nx < 0 || nx >= W)
                continue;
            const cell = grid[ny][nx];
            if (cell === '#')
                continue;
            const cost = cell === 'S' || cell === 'T' ? 0 : parseInt(cell, 10);
            const newD = d + cost;
            if (newD < dist[ny][nx]) {
                dist[ny][nx] = newD;
                pq.push([newD, ny, nx]);
            }
        }
    }
    console.log(-1);
}
solve();
