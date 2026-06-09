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
    constructor() { this.data = []; }
    push(item) {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    peek() { return this.data[0]; }
    size() { return this.data.length; }
    isEmpty() { return this.data.length === 0; }
    bubbleUp(idx) {
        const item = this.data[idx];
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            if (this.data[parent].cost <= item.cost)
                break;
            this.data[idx] = this.data[parent];
            idx = parent;
        }
        this.data[idx] = item;
    }
    bubbleDown(idx) {
        const item = this.data[idx];
        const len = this.data.length;
        while (true) {
            let left = 2 * idx + 1;
            let right = 2 * idx + 2;
            let smallest = idx;
            if (left < len && this.data[left].cost < item.cost)
                smallest = left;
            if (right < len && this.data[right].cost < this.data[smallest].cost)
                smallest = right;
            if (smallest === idx)
                break;
            this.data[idx] = this.data[smallest];
            idx = smallest;
        }
        this.data[idx] = item;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim().split(/\r?\n/);
    const [H, W] = input[0].split(/\s+/).map(Number);
    const grid = [];
    let sr = -1, sc = -1, tr = -1, tc = -1;
    for (let i = 1; i <= H; i++) {
        const row = input[i];
        grid.push(row);
        for (let j = 0; j < row.length; j++) {
            const ch = row[j];
            if (ch === 'S') {
                sr = i - 1;
                sc = j;
            }
            else if (ch === 'T') {
                tr = i - 1;
                tc = j;
            }
        }
    }
    if (sr === -1 || sc === -1 || tr === -1 || tc === -1) {
        console.log(-1);
        return;
    }
    const dist = Array.from({ length: H }, () => new Array(W).fill(Infinity));
    dist[sr][sc] = 0;
    const heap = new MinHeap();
    heap.push({ cost: 0, r: sr, c: sc });
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (!heap.isEmpty()) {
        const current = heap.pop();
        if (!current)
            break;
        const { cost, r, c } = current;
        if (cost > dist[r][c])
            continue;
        if (r === tr && c === tc) {
            console.log(cost);
            return;
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const cell = grid[nr][nc];
            if (cell === '#')
                continue;
            let addCost = 0;
            if (cell === 'S' || cell === 'T') {
                addCost = 0;
            }
            else {
                addCost = parseInt(cell, 10);
            }
            const newCost = cost + addCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                heap.push({ cost: newCost, r: nr, c: nc });
            }
        }
    }
    console.log(-1);
}
main();
