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
    push(item) {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }
    isEmpty() {
        return this.data.length === 0;
    }
    siftUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.data[parent][0] <= this.data[i][0])
                break;
            [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
            i = parent;
        }
    }
    siftDown(i) {
        while (true) {
            let left = 2 * i + 1;
            let right = 2 * i + 2;
            let smallest = i;
            if (left < this.data.length && this.data[left][0] < this.data[smallest][0])
                smallest = left;
            if (right < this.data.length && this.data[right][0] < this.data[smallest][0])
                smallest = right;
            if (smallest === i)
                break;
            [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
            i = smallest;
        }
    }
}
const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n');
const [H, W] = lines[0].split(' ').map(Number);
const grid = [];
let startY = -1;
let startX = -1;
for (let y = 0; y < H; y++) {
    const row = lines[y + 1] || '';
    const newRow = [];
    for (let x = 0; x < W; x++) {
        const char = row[x] || ' ';
        if (char === 'S') {
            startY = y;
            startX = x;
            newRow.push(0);
        }
        else if (char === 'T') {
            newRow.push(0);
        }
        else if (char === '#') {
            newRow.push(-1);
        }
        else {
            newRow.push(parseInt(char));
        }
    }
    grid.push(newRow);
}
const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
dist[startY][startX] = 0;
const pq = new MinHeap();
pq.push([0, startY, startX]);
const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
while (!pq.isEmpty()) {
    const [d, y, x] = pq.pop();
    if (d > dist[y][x])
        continue;
    for (const [dy, dx] of directions) {
        const ny = y + dy;
        const nx = x + dx;
        if (ny < 0 || ny >= H || nx < 0 || nx >= W)
            continue;
        const cost = grid[ny][nx];
        if (cost === -1)
            continue;
        const newDist = d + cost;
        if (newDist < dist[ny][nx]) {
            dist[ny][nx] = newDist;
            pq.push([newDist, ny, nx]);
        }
    }
}
const result = dist[startY][startX];
console.log(result === Infinity ? -1 : result);
