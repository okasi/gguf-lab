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
    push(priority, data) {
        this.heap.push({ priority, data });
        this.bubbleUp();
    }
    pop() {
        if (this.size() === 0)
            return undefined;
        const top = this.heap[0].data;
        const bottom = this.heap.pop();
        if (this.size() > 0) {
            this.heap[0] = bottom;
            this.bubbleDown();
        }
        return top;
    }
    size() {
        return this.heap.length;
    }
    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIndex = (index - 1) >> 1;
            if (this.heap[index].priority >= this.heap[parentIndex].priority)
                break;
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            index = parentIndex;
        }
    }
    bubbleDown() {
        let index = 0;
        const length = this.heap.length;
        while (true) {
            let left = (index << 1) + 1;
            let right = (index << 1) + 2;
            let smallest = index;
            if (left < length && this.heap[left].priority < this.heap[smallest].priority)
                smallest = left;
            if (right < length && this.heap[right].priority < this.heap[smallest].priority)
                smallest = right;
            if (smallest === index)
                break;
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    if (input.length < 2)
        return;
    const H = parseInt(input[0], 10);
    const W = parseInt(input[1], 10);
    const grid = [];
    let start = [-1, -1];
    let target = [-1, -1];
    for (let i = 0; i < H; i++) {
        const row = input[i + 2].split("");
        grid.push(row);
        for (let j = 0; j < W; j++) {
            if (row[j] === "S")
                start = [i, j];
            if (row[j] === "T")
                target = [i, j];
        }
    }
    const dist = Array.from({ length: H }, () => new Int32Array(W).fill(2147483647));
    const pq = new MinHeap();
    dist[start[0]][start[1]] = 0;
    pq.push(0, [start[0], start[1]]);
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    while (pq.size() > 0) {
        const curr = pq.pop();
        const [r, c] = curr;
        const d = dist[r][c];
        if (r === target[0] && c === target[1]) {
            process.stdout.write(d.toString() + "\n");
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char === "#")
                    continue;
                let weight = 0;
                if (char >= "0" && char <= "9") {
                    weight = char.charCodeAt(0) - "0".charCodeAt(0);
                }
                if (dist[nr][nc] > d + weight) {
                    dist[nr][nc] = d + weight;
                    pq.push(dist[nr][nc], [nr, nc]);
                }
            }
        }
    }
    process.stdout.write("-1\n");
}
solve();
