import * as fs from 'fs';

function solve() {
    const input = fs.readFileSync(0, 'utf8').split(/\r?\n/);
    if (input.length === 0) return;

    const firstLine = input[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;
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
            if (char === 'S') start = [r, c];
            if (char === 'T') target = [r, c];
        }
    }

    if (!start || !target) {
        console.log("-1");
        return;
    }

    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const visited = Array.from({ length: H }, () => Array(W).fill(false));

    dist[start[0]][start[1]] = 0;

    const pq: [number, number, number][] = [[0, start[0], start[1]]];

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (pq.length > 0) {
        // Sort to simulate a Min-Priority Queue
        pq.sort((a, b) => a[0] - b[0]);
        const [d, r, c] = pq.shift()!;

        if (visited[r][c]) continue;
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
                if (cell === '#') continue;

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
