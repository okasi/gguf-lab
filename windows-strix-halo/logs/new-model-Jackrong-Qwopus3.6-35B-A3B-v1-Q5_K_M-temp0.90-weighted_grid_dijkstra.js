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
        this.data = [];
        this.compare = compare;
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
    get size() {
        return this.data.length;
    }
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.data[index], this.data[parentIndex]) < 0) {
                [this.data[index], this.data[parentIndex]] = [this.data[parentIndex], this.data[index]];
                index = parentIndex;
            }
            else {
                break;
            }
        }
    }
    sinkDown(index) {
        const length = this.data.length;
        while (true) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;
            if (leftChild < length && this.compare(this.data[leftChild], this.data[smallest]) < 0) {
                smallest = leftChild;
            }
            if (rightChild < length && this.compare(this.data[rightChild], this.data[smallest]) < 0) {
                smallest = rightChild;
            }
            if (smallest !== index) {
                [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
                index = smallest;
            }
            else {
                break;
            }
        }
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    if (input.length < 1)
        return;
    const [H, W] = input[0].split(" ").map(Number);
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i] || "");
    }
    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === "S") {
                startR = r;
                startC = c;
            }
            else if (grid[r][c] === "T") {
                targetR = r;
                targetC = c;
            }
        }
    }
    if (startR === -1 || targetR === -1) {
        console.log("-1");
        return;
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    const dir = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const heap = new MinHeap((a, b) => a.cost - b.cost);
    heap.push({ r: startR, c: startC, cost: 0 });
    while (heap.size > 0) {
        const curr = heap.pop();
        const { r, c, cost } = curr;
        if (cost > dist[r][c])
            continue;
        if (r === targetR && c === targetC) {
            console.log(cost);
            return;
        }
        for (const [dr, dc] of dir) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                if (cell === "#")
                    continue;
                let enterCost = 0;
                if (cell >= "0" && cell <= "9") {
                    enterCost = parseInt(cell, 10);
                }
                const newCost = cost + enterCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    heap.push({ r: nr, c: nc, cost: newCost });
                }
            }
        }
    }
    console.log("-1");
}
solve();
