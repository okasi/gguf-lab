import * as fs from 'fs';
import { PriorityQueue } from '@datastructures-js/priority-queue';

/**
 * Finds the minimum cost path from 'S' to 'T' in a grid with variable movement costs.
 * Uses Dijkstra's algorithm.
 */
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0) return;

    const [hStr, wStr] = input[0].trim().split(/\s+/);
    const H = parseInt(hStr);
    const W = parseInt(wStr);

    const grid: string[][] = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].trim().split(''));
    }

    let startRow = -1, startCol = -1;
    let targetRow = -1, targetCol = -1;

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

    // Distances initialized to infinity
    const dist: number[][] = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    
    // Priority Queue stores [cost, row, col]
    // We use a min-heap based on cost.
    const pq = new PriorityQueue<[number, number, number]>((a, b) => a[0] - b[0]);

    // Initialize start node
    dist[startRow][startCol] = 0;
    pq.enqueue([0, startRow, startCol]);

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (!pq.isEmpty()) {
        const [currentCost, r, c] = pq.dequeue() as [number, number, number];

        if (currentCost > dist[r][c]) {
            continue;
        }

        if (r === targetRow && c === targetCol) {
            console.log(currentCost);
            return;
        }

        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                let moveCost = 0;

                if (cell === '#') {
                    // Wall
                    continue;
                } else if (cell === 'S' || cell === 'T') {
                    // Start or Target cost is 0 to enter
                    moveCost = 0;
                } else if (cell >= '0' && cell <= '9') {
                    // Digit cost
                    moveCost = parseInt(cell);
                } else {
                    // Should not happen based on problem description
                    continue;
                }

                const newCost = currentCost + moveCost;

                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.enqueue([newCost, nr, nc]);
                }
            }
        }
    }

    // If target was not reached
    console.log(-1);
}

solve();
