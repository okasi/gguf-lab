import { readFileSync } from 'fs';

function solve(): void {
    const input = readFileSync(0, "utf8");
    const lines = input.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length < 2) {
        console.log(-1);
        return;
    }

    const firstLine = lines[0].split(/\s+/).map(Number);
    const H = firstLine[0];
    const W = firstLine[1];

    const grid: string[][] = [];
    let startRow = -1;
    let startCol = -1;
    let targetRow = -1;
    let targetCol = -1;

    for (let i = 1; i <= H; i++) {
        const row = lines[i];
        grid.push(row.split(''));
    }

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startRow = r;
                startCol = c;
            } else if (grid[r][c] === 'T') {
                targetRow = r;
                targetCol = c;
            }
        }
    }

    if (startRow === -1 || targetRow === -1) {
        console.log(-1);
        return;
    }

    const directions = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const visited: boolean[][] = Array.from({ length: H }, () => Array(W).fill(false));

    // Priority queue using a simple array, sorted by distance
    // Element: [cost, row, col]
    const pq: [number, number, number][] = [[0, startRow, startCol]];
    dist[startRow][startCol] = 0;

    while (pq.length > 0) {
        // Extract min element
        pq.sort((a, b) => a[0] - b[0]);
        const [cost, r, c] = pq.shift()!;

        if (visited[r][c]) continue;
        visited[r][c] = true;

        if (r === targetRow && c === targetCol) {
            console.log(cost);
            return;
        }

        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W && !visited[nr][nc]) {
                const cell = grid[nr][nc];
                if (cell === '#') continue;

                let weight = 0;
                if (cell >= '0' && cell <= '9') {
                    weight = parseInt(cell);
                }
                // S and T cost 0

                const newCost = cost + weight;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.push([newCost, nr, nc]);
                }
            }
        }
    }

    console.log(-1);
}

solve();
