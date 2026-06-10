import fs from 'fs';

function solve(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    
    const [H, W] = lines[0].split(' ').map(Number);
    
    const grid: string[][] = [];
    for (let i = 0; i < H; i++) {
        grid.push(lines[i + 1].split(''));
    }
    
    let start: [number, number] | null = null;
    let target: [number, number] | null = null;
    
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const ch = grid[r][c];
            if (ch === 'S') {
                start = [r, c];
            } else if (ch === 'T') {
                target = [r, c];
            }
        }
    }
    
    if (!start || !target) {
        console.log(-1);
        return;
    }
    
    // Dijkstra's algorithm
    // Cost to enter a cell: digit 0-9 for digit cells, 0 for S and T
    const INF = Number.MAX_SAFE_INTEGER;
    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(INF));
    
    const pq: [number, number, number][] = []; // [cost, row, col]
    
    dist[start[0]][start[1]] = 0;
    pq.push([0, start[0], start[1]]);
    
    // Sort function for min-heap
    const minHeapSort = (a: [number, number, number], b: [number, number, number]): number => {
        return a[0] - b[0];
    };
    
    const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    while (pq.length > 0) {
        // Find the minimum element
        let minIdx = 0;
        for (let i = 1; i < pq.length; i++) {
            if (pq[i][0] < pq[minIdx][0]) {
                minIdx = i;
            }
        }
        
        const [cost, r, c] = pq.splice(minIdx, 1)[0];
        
        if (cost > dist[r][c]) {
            continue;
        }
        
        if (r === target[0] && c === target[1]) {
            console.log(cost);
            return;
        }
        
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) {
                continue;
            }
            
            const ch = grid[nr][nc];
            
            if (ch === '#') {
                continue;
            }
            
            let enterCost = 0;
            if (ch >= '0' && ch <= '9') {
                enterCost = parseInt(ch);
            }
            
            const newCost = cost + enterCost;
            
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.push([newCost, nr, nc]);
            }
        }
    }
    
    console.log(-1);
}

solve();
