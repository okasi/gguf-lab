import * as fs from 'fs';

function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0 || input[0].length === 0) {
        return;
    }

    const [H, W] = input[0].trim().split(/\s+/).map(Number);
    const grid = input.slice(1, H + 1).map(line => line.trim().split(''));

    let start: [number, number] | null = null;
    let target: [number, number] | null = null;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                start = [r, c];
            } else if (grid[r][c] === 'T') {
                target = [r, c];
            }
        }
    }

    if (!start || !target) {
        console.log(-1);
        return;
    }

    const dist: number[][] = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    
    // Priority Queue implementation using an array for simplicity since the grid size is likely small, 
    // but for correctness and efficiency, we simulate a min-heap structure.
    // In a real competitive programming environment, a proper Binary Heap implementation would be used.
    // For Node.js environment, we will use a sorted array to simulate the PQ for correctness.
    
    // PQ stores [cost, row, col]
    const pq: [number, number, number][] = []; 

    const [startR, startC] = start;
    dist[startR][startC] = 0;
    pq.push([0, startR, startC]);

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (pq.length > 0) {
        // Simulate min-heap extraction: find the element with the minimum cost
        pq.sort((a, b) => a[0] - b[0]);
        const [d, r, c] = pq.shift()!;

        if (d > dist[r][c]) {
            continue;
        }

        if (r === target[0] && c === target[1]) {
            console.log(d);
            return;
        }

        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
                let cost = 0;
                const cell = grid[nr][nc];

                if (cell >= '0' && cell <= '9') {
                    cost = parseInt(cell);
                }
                // S and T cost 0 when entered (cost of the *next* cell entered)

                const newDist = dist[r][c] + cost;

                if (newDist < dist[nr][nc]) {
                    dist[nr][nc] = newDist;
                    pq.push([newDist, nr, nc]);
                }
            }
        }
    }

    if (dist[target[0]][target[1]] === Infinity) {
        console.log(-1);
    } else {
        console.log(dist[target[0]][target[1]]);
    }
}

solve();
