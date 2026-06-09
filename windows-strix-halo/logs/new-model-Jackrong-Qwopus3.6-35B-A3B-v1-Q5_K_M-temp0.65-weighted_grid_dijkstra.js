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
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }
    get length() {
        return this.data.length;
    }
    bubbleUp(i) {
        while (i > 0) {
            const parentIndex = Math.floor((i - 1) / 2);
            if (this.data[parentIndex][0] <= this.data[i][0])
                break;
            [this.data[parentIndex], this.data[i]] = [this.data[i], this.data[parentIndex]];
            i = parentIndex;
        }
    }
    bubbleDown(i) {
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < this.data.length && this.data[left][0] < this.data[smallest][0]) {
                smallest = left;
            }
            if (right < this.data.length && this.data[right][0] < this.data[smallest][0]) {
                smallest = right;
            }
            if (smallest === i)
                break;
            [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
            i = smallest;
        }
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split('\n');
    const [H, W] = lines[0].split(' ').map(Number);
    const grid = lines.slice(1, H + 1);
    let startRow = -1, startCol = -1;
    let targetRow = -1, targetCol = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startRow = r;
                startCol = c;
            }
            else if (grid[r][c] === 'T') {
                targetRow = r;
                targetCol = c;
            }
        }
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startRow][startCol] = 0;
    const pq = new MinHeap();
    pq.push([0, startRow, startCol]);
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (pq.length > 0) {
        const [cost, r, c] = pq.pop();
        if (r === targetRow && c === targetCol) {
            console.log(cost);
            return;
        }
        if (cost > dist[r][c])
            continue;
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                if (cell !== '#') {
                    const weight = cell === 'S' || cell === 'T' ? 0 : parseInt(cell, 10);
                    const newCost = cost + weight;
                    if (newCost < dist[nr][nc]) {
                        dist[nr][nc] = newCost;
                        pq.push([newCost, nr, nc]);
                    }
                }
            }
        }
    }
    console.log(-1);
}
main();
