import { readFileSync } from "fs";

const input = readFileSync(0, "utf8").trim();
const lines = input.split(/\n/);
const [H, W] = lines[0].split(" ").map(Number);

const grid: string[][] = [];
for (let i = 0; i < H; i++) {
    grid.push(lines[i + 1].split(""));
}

let startR = -1, startC = -1;
let targetR = -1, targetC = -1;

for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
        if (grid[r][c] === "S") {
            startR = r;
            startC = c;
        } else if (grid[r][c] === "T") {
            targetR = r;
            targetC = c;
        }
    }
}

const dist: number[][] = Array.from({ length: H }, () =>
    Array(W).fill(Infinity)
);

dist[startR][startC] = 0;

const dr = [-1, 1, 0, 0];
const dc = [0, 0, -1, 1];

const pq: [number, number, number][] = []; // [cost, r, c]
pq.push([0, startR, startC]);

while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [cost, r, c] = pq.shift()!;

    if (cost > dist[r][c]) {
        continue;
    }

    if (r === targetR && c === targetC) {
        process.stdout.write(cost.toString() + "\n");
        process.exit(0);
    }

    for (let d = 0; d < 4; d++) {
        const nr = r + dr[d];
        const nc = c + dc[d];

        if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;

        const cell = grid[nr][nc];
        if (cell === "#") continue;

        let moveCost = 0;
        if (cell >= "0" && cell <= "9") {
            moveCost = parseInt(cell, 10);
        }
        // S and T cost 0 to enter

        const newDist = cost + moveCost;
        if (newDist < dist[nr][nc]) {
            dist[nr][nc] = newDist;
            pq.push([newDist, nr, nc]);
        }
    }
}

process.stdout.write("-1\n");
