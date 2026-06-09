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
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [H, W] = lines[0].split(" ").map(Number);
    const grid = [];
    let startR = -1, startC = -1;
    for (let i = 0; i < H; i++) {
        grid.push([...lines[i + 1]]);
        for (let j = 0; j < W; j++) {
            if (grid[i][j] === "S") {
                startR = i;
                startC = j;
            }
        }
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    const heap = [];
    function push(cost, r, c) {
        heap.push([cost, r, c]);
        let i = heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (heap[parent][0] <= heap[i][0])
                break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    }
    function pop() {
        if (heap.length === 0)
            return undefined;
        const top = heap[0];
        heap[0] = heap[heap.length - 1];
        heap.pop();
        let i = 0;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < heap.length && heap[left][0] < heap[smallest][0])
                smallest = left;
            if (right < heap.length && heap[right][0] < heap[smallest][0])
                smallest = right;
            if (smallest === i)
                break;
            [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
            i = smallest;
        }
        return top;
    }
    push(0, startR, startC);
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    while (heap.length > 0) {
        const [cost, r, c] = pop();
        if (cost > dist[r][c])
            continue;
        if (grid[r][c] === "T") {
            console.log(cost);
            return;
        }
        for (let d = 0; d < 4; d++) {
            const nr = r + dr[d];
            const nc = c + dc[d];
            if (nr < 0 || nr >= H || nc < 0 || nc >= W)
                continue;
            const cell = grid[nr][nc];
            if (cell === "#")
                continue;
            const moveCost = (cell === "S" || cell === "T") ? 0 : parseInt(cell, 10);
            const newCost = cost + moveCost;
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                push(newCost, nr, nc);
            }
        }
    }
    console.log(-1);
}
main();
