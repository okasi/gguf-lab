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
    get size() {
        return this.data.length;
    }
    peek() {
        return this.data[0];
    }
    push(item) {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }
    pop() {
        if (this.data.length === 0)
            return undefined;
        if (this.data.length === 1)
            return this.data.pop();
        const result = this.data[0];
        this.data[0] = this.data.pop();
        this.siftDown(0);
        return result;
    }
    compare(a, b) {
        if (a.cost !== b.cost)
            return a.cost - b.cost;
        if (a.r !== b.r)
            return a.r - b.r;
        return a.c - b.c;
    }
    siftUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.compare(this.data[parent], this.data[index]) <= 0)
                break;
            this.swap(parent, index);
            index = parent;
        }
    }
    siftDown(index) {
        while (true) {
            const left = index * 2 + 1;
            const right = left + 1;
            let smallest = index;
            if (left < this.data.length && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.data.length && this.compare(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }
            if (smallest === index)
                break;
            this.swap(index, smallest);
            index = smallest;
        }
    }
    swap(a, b) {
        const temp = this.data[a];
        this.data[a] = this.data[b];
        this.data[b] = temp;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split(/\r?\n/);
    const [hLine, ...gridLines] = lines;
    const [hText, wText] = hLine.trim().split(/\s+/);
    const H = Number(hText);
    const W = Number(wText);
    const grid = gridLines.slice(0, H);
    let sr = -1;
    let sc = -1;
    let tr = -1;
    let tc = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const cell = grid[r][c];
            if (cell === "S") {
                sr = r;
                sc = c;
            }
            else if (cell === "T") {
                tr = r;
                tc = c;
            }
        }
    }
    if (sr === -1 || tr === -1) {
        console.log(-1);
        return;
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const heap = new MinHeap();
    dist[sr][sc] = 0;
    heap.push({ r: sr, c: sc, cost: 0 });
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];
    while (heap.size > 0) {
        const current = heap.pop();
        const { r, c, cost } = current;
        if (cost !== dist[r][c])
            continue;
        if (r === tr && c === tc) {
            console.log(cost);
            return;
        }
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const cell = grid[nr][nc];
            if (cell === "#")
                continue;
            const nextCost = cell >= "0" && cell <= "9" ? Number(cell) : 0;
            const total = cost + nextCost;
            if (total < dist[nr][nc]) {
                dist[nr][nc] = total;
                heap.push({ r: nr, c: nc, cost: total });
            }
        }
    }
    console.log(dist[tr][tc] === Infinity ? -1 : dist[tr][tc]);
}
main();
