import * as fs from 'fs';

interface Node {
    r: number;
    c: number;
    cost: number;
}

function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\r?\n/);
    if (input.length === 0) return;

    const [H, W] = input[0].trim().split(/\s+/).map(Number);
    const grid = [];
    let start: [number, number] | null = null;
    let target: [number, number] | null = null;

    for (let i = 0; i < H; i++) {
        const row = input[i + 1].trim().split('');
        grid.push(row);
        for (let j = 0; j < W; j++) {
            if (row[j] === 'S') start = [i, j];
            if (row[j] === 'T') target = [i, j];
        }
    }

    if (!start || !target) {
        console.log("-1");
        return;
    }

    // Dijkstra's algorithm
    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const visited = Array.from({ length: H }, () => Array(W).fill(false));

    dist[start[0]][start[1]] = 0;

    // Simple Priority Queue implementation (Min-Heap)
    const pq: Node[] = [{ r: start[0], c: start[1], cost: 0 }];

    while (pq.length > 0) {
        // Extract node with minimum cost
        let minIdx = 0;
        for (let i = 1; i < pq.length; i++) {
            if (pq[i].cost < pq[minIdx].cost) minIdx = i;
        }
        const { r, c, cost } = pq.splice(minIdx, 1)[0];

        if (visited[r][c]) continue;
        visited[r][c] = true;

        if (r === target[0] && c === target[1]) {
            console.log(cost);
            return;
        }

        const dr = [-1, 1, 0, 0];
        const dc = [0, 0, -1, 1];

        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
                let moveCost = 0;
                const cell = grid[nr][nc];
                
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell, 10);
                }

                const newCost = cost + moveCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.push({ r: nr, c: nc, cost: newCost });
                }
            }
        }
    }

    console.log("-1");
}

solve();
