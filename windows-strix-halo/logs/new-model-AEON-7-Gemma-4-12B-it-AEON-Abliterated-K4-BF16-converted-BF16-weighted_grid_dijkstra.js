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
function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\r?\n/);
    if (input.length === 0)
        return;
    const firstLine = input[0].trim().split(/\s+/);
    if (firstLine.length < 2)
        return;
    const H = parseInt(firstLine[0]);
    const W = parseInt(firstLine[1]);
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].trim().split(''));
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
    // Simple Min-Priority Queue implementation (Binary Heap)
    const pq = [];
    const push = (node) => {
        pq.push(node);
        let idx = pq.length - 1;
        while (idx > 0) {
            let parent = Math.floor((idx - 1) / 2);
            if (pq[idx].cost < pq[parent].cost) {
                [pq[idx], pq[parent]] = [pq[parent], pq[idx]];
                idx = parent;
            }
            else
                break;
        }
    };
    const pop = () => {
        if (pq.length === 0)
            return undefined;
        const top = pq[0];
        const last = pq.pop();
        if (pq.length > 0) {
            pq[0] = last;
            let idx = 0;
            while (true) {
                let left = 2 * idx + 1;
                let right = 2 * idx + 2;
                let smallest = idx;
                if (left < pq.length && pq[left].cost < pq[smallest].cost)
                    smallest = left;
                if (right < pq.length && pq[right].cost < pq[smallest].cost)
                    smallest = right;
                if (smallest !== idx) {
                    [pq[idx], pq[smallest]] = [pq[smallest], pq[idx]];
                    idx = smallest;
                }
                else
                    break;
            }
        }
        return top;
    };
    dist[startR][startC] = 0;
    push({ r: startR, c: startC, cost: 0 });
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    while (pq.length > 0) {
        const { r, c, cost } = pop();
        if (cost > dist[r][c])
            continue;
        if (r === targetR && c === targetC) {
            console.log(cost);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
                let moveCost = 0;
                const cell = grid[nr][nc];
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell);
                }
                // S and T cost 0
                if (dist[r][c] + moveCost < dist[nr][nc]) {
                    dist[nr][nc] = dist[r][c] + moveCost;
                    push({ r: nr, c: nc, cost: dist[nr][nc] });
                }
            }
        }
    }
    console.log(-1);
}
solve();
