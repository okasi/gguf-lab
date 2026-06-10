import { readFileSync } from 'fs';

function solve(): void {
    const input: string = readFileSync(0, "utf8").trim();
    const lines: string[] = input.split('\n');
    
    const firstLine: string[] = lines[0].split(' ').map(Number);
    const H: number = firstLine[0];
    const W: number = firstLine[1];
    
    const grid: string[][] = [];
    let startR: number = -1;
    let startC: number = -1;
    let endR: number = -1;
    let endC: number = -1;
    
    for (let r: number = 0; r < H; r++) {
        grid[r] = lines[r + 1].split('');
        for (let c: number = 0; c < W; c++) {
            const cell: string = grid[r][c];
            if (cell === 'S') {
                startR = r;
                startC = c;
            } else if (cell === 'T') {
                endR = r;
                endC = c;
            }
        }
    }
    
    const dist: number[][] = Array(H).fill(null).map(() => Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    
    // Priority queue: [cost, r, c]
    // Using a simple array as a priority queue (min-heap simulation or just sorting)
    // For large grids, a proper min-heap is better, but for typical competitive programming constraints,
    // an array-based approach with sorting or unshift/unshift can work if N is small.
    // However, to be safe and efficient, let's implement a simple min-heap or use Array.sort.
    // Given the constraints are not specified, let's use Array.sort for simplicity as it's O(N log N) per extract.
    
    const pq: [number, number, number][] = [[0, startR, startC]];
    
    const directions: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    while (pq.length > 0) {
        // Extract min
        pq.sort((a, b) => a[0] - b[0]);
        const [cost, r, c] = pq.shift()!;
        
        if (cost > dist[r][c]) continue;
        
        if (r === endR && c === endC) {
            console.log(cost);
            return;
        }
        
        for (const [dr, dc] of directions) {
            const nr: number = r + dr;
            const nc: number = c + dc;
            
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell: string = grid[nr][nc];
                if (cell === '#') continue;
                
                let newCost: number = cost;
                if (cell !== 'S' && cell !== 'T') {
                    newCost += parseInt(cell, 10);
                }
                
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
