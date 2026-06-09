"use strict";
function main() {
    // Read input
    const [h, w] = readLine().split(' ').map(Number);
    const grid = readFileSync(0, "utf8").trim().split('\n');
    // Find start and target positions
    const start = {};
    const target = {};
    for (let i = 0; i < h; i++) {
        const line = grid[i];
        if (line.includes('S')) {
            start.row = i;
            start.col = 0;
            break;
        }
        if (line.includes('T')) {
            target.row = i;
            target.col = 0;
            break;
        }
    }
    // Convert grid to costs
    const cost = Array.from({ length: h }, () => new Array(w).fill(Infinity));
    cost[start.row][start.col] = 0;
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            cost[i][j] = parseInt(grid[i][j], 10);
        }
    }
    // Dijkstra's algorithm
    const dist = Array.from({ length: h }, () => new Array(w).fill(Infinity));
    const pq = [[start.row, start.col], 0];
    dist[start.row][start.col] = 0;
    while (pq.length > 0) {
        const [r, c] = pq.pop();
        const d = dist[r][c];
        // neighbors: up, down, left, right
        const directions = [
            [-1, -1],
            [-1, 0],
            [0, -1],
            [0, 0]
        ];
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < h && nc >= 0 && nc < w && cost[nr][nc] !== Infinity) {
                const newDist = d + cost[nr][nc];
                if (newDist < dist[nr][nc]) {
                    dist[nr][nc] = newDist;
                    pq.push([nr, nc], newDist);
                }
            }
        }
    }
    // Find minimum cost from start to any target
    const minCost = Infinity;
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            if (cost[r][c] === 0) {
                minCost = Math.min(minCost, dist[r][c]);
            }
        }
    }
    if (minCost === Infinity) {
        console.log("-1");
    }
    else {
        console.log(minCost);
    }
}
main();
