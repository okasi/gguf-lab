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
    const input = fs.readFileSync(0, 'utf8').split(/\r?\n/);
    if (input.length === 0)
        return;
    const firstLine = input[0].trim().split(/\s+/);
    if (firstLine.length < 2)
        return;
    const H = parseInt(firstLine[0]);
    const W = parseInt(firstLine[1]);
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].trim().split(/(\s+)/).filter(x => x.length > 0));
    }
    let start = null;
    let target = null;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const char = grid[r][c];
            if (char === 'S')
                start = [r, c];
            if (char === 'T')
                target = [r, c];
        }
    }
    if (!start || !target) {
        console.log("-1");
        return;
    }
    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const visited = Array.from({ length: H }, () => Array(W).fill(false));
    dist[start[0]][start[1]] = 0;
    const pq = [[0, start[0], start[1]]];
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    while (pq.length > 0) {
        // Sort to simulate a Min-Priority Queue
        pq.sort((a, b) => a[0] - b[0]);
        const [d, r, c] = pq.shift();
        if (visited[r][c])
            continue;
        visited[r][c] = true;
        if (r === target[0] && c === target[1]) {
            console.log(d);
            return;
        }
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                if (cell === '#')
                    continue;
                let moveCost = 0;
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell);
                }
                if (dist[r][c] + moveCost < dist[nr][nc]) {
                    dist[nr][nc] = dist[r][c] + moveCost;
                    pq.push([dist[nr][nc], nr, nc]);
                }
            }
        }
    }
    console.log("-1");
}
solve();
