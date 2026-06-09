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
    push(val) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.heap.length === 0)
            return null;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (this.heap[parent].cost <= this.heap[index].cost)
                break;
            const temp = this.heap[parent];
            this.heap[parent] = this.heap[index];
            this.heap[index] = temp;
            index = parent;
        }
    }
    bubbleDown(index) {
        const len = this.heap.length;
        while (true) {
            let smallest = index;
            const left = (index << 1) + 1;
            const right = (index << 1) + 2;
            if (left < len && this.heap[left].cost < this.heap[smallest].cost) {
                smallest = left;
            }
            if (right < len && this.heap[right].cost < this.heap[smallest].cost) {
                smallest = right;
            }
            if (smallest === index)
                break;
            const temp = this.heap[smallest];
            this.heap[smallest] = this.heap[index];
            this.heap[index] = temp;
            index = smallest;
        }
    }
}
function solve() {
    const inputData = fs.readFileSync(0, "utf8");
    const input = inputData.trim().split(/\s+/);
    if (input.length < 2)
        return;
    const H = parseInt(input[0]);
    const W = parseInt(input[1]);
    if (isNaN(H) || isNaN(W))
        return;
    let allCharsArr = [];
    for (let i = 2; i < input.length; i++) {
        allCharsArr.push(input[i]);
    }
    const allChars = allCharsArr.join('');
    const grid = [];
    for (let i = 0; i < H; i++) {
        const row = [];
        for (let j = 0; j < W; j++) {
            row.push(allChars[i * W + j]);
        }
        grid.push(row);
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
    if (startR === -1 || targetR === -1)
        return;
    const dist = Array.from({ length: H }, () => new Float64Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    const pq = new MinHeap();
    pq.push({ cost: 0, r: startR, c: startC });
    const dr = [0, 0, 1, -1];
    const dc = [1, -1, 0, 0];
    while (!pq.isEmpty()) {
        const curr = pq.pop();
        if (!curr)
            break;
        const { cost, r, c } = curr;
        if (cost > dist[r][c])
            continue;
        if (r === targetR && c === targetC)
            break;
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char === '#')
                    continue;
                let weight = 0;
                if (char >= '0' && char <= '9') {
                    weight = char.charCodeAt(0) - 48;
                }
                if (dist[r][c] + weight < dist[nr][nc]) {
                    dist[nr][nc] = dist[r][c] + weight;
                    pq.push({ cost: dist[nr][nc], r: nr, c: nc });
                }
            }
        }
    }
    const ans = dist[targetR][targetC];
    process.stdout.write((ans === Infinity ? -1 : ans).toString() + '\n');
}
solve();
