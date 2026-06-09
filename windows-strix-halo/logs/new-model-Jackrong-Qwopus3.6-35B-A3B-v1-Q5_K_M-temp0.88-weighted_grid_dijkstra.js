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
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const min = this.data[0];
        const end = this.data.pop();
        if (this.data.length > 0 && end) {
            this.data[0] = end;
            this.sinkDown(0);
        }
        return min;
    }
    get size() {
        return this.data.length;
    }
    swap(i, j) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.data[parent][0] <= this.data[index][0])
                break;
            this.swap(parent, index);
            index = parent;
        }
    }
    sinkDown(index) {
        const length = this.data.length;
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;
            if (left < length && this.data[left][0] < this.data[smallest][0]) {
                smallest = left;
            }
            if (right < length && this.data[right][0] < this.data[smallest][0]) {
                smallest = right;
            }
            if (smallest === index)
                break;
            this.swap(index, smallest);
            index = smallest;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split('\n');
    if (lines.length === 0) {
        console.log(-1);
        return;
    }
    const [H, W] = lines[0].trim().split(' ').map(Number);
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(lines[i]);
    }
    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startR = r;
                startC = c;
            }
            else if (grid[r][c] === 'T') {
                targetR = r;
                targetC = c;
            }
        }
    }
    const dist = Array.from({ length: H }, () => new Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    const heap = new MinHeap();
    heap.push([0, startR, startC]);
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (heap.size > 0) {
        const item = heap.pop();
        if (!item)
            continue;
        const [d, r, c] = item;
        if (d > dist[r][c])
            continue;
        if (r === targetR && c === targetC) {
            console.log(d);
            return;
        }
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const cell = grid[nr][nc];
            if (cell === '#')
                continue;
            const cost = (cell === 'S' || cell === 'T') ? 0 : Number(cell);
            const newDist = d + cost;
            if (newDist < dist[nr][nc]) {
                dist[nr][nc] = newDist;
                heap.push([newDist, nr, nc]);
            }
        }
    }
    console.log(-1);
}
solve();
