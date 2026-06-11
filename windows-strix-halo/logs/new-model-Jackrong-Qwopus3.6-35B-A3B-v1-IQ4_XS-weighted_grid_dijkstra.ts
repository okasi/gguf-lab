import * as fs from 'fs';

function solve(): void {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');
    
    const [H, W] = lines[0].split(' ').map(Number);
    const grid: string[][] = [];
    let startX = 0;
    let startY = 0;
    let targetX = 0;
    let targetY = 0;

    for (let i = 0; i < H; i++) {
        grid[i] = lines[i + 1].split('');
        for (let j = 0; j < W; j++) {
            if (grid[i][j] === 'S') {
                startX = j;
                startY = i;
            } else if (grid[i][j] === 'T') {
                targetX = j;
                targetY = i;
            }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startY][startX] = 0;

    const pq: { x: number; y: number; cost: number }[] = [];
    pq.push({ x: startX, y: startY, cost: 0 });

    const dx = [0, 0, 1, -1];
    const dy = [1, -1, 0, 0];

    while (pq.length > 0) {
        // Simple priority queue using sorting. For large grids, a proper heap would be better.
        pq.sort((a, b) => a.cost - b.cost);
        const curr = pq.shift()!;

        if (curr.cost > dist[curr.y][curr.x]) {
            continue;
        }

        if (curr.x === targetX && curr.y === targetY) {
            console.log(curr.cost);
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nx = curr.x + dx[i];
            const ny = curr.y + dy[i];

            if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                const cell = grid[ny][nx];
                if (cell !== '#') {
                    let cost = 0;
                    if (cell >= '0' && cell <= '9') {
                        cost = parseInt(cell);
                    }
                    
                    if (dist[curr.y][curr.x] + cost < dist[ny][nx]) {
                        dist[ny][nx] = dist[curr.y][curr.x] + cost;
                        pq.push({ x: nx, y: ny, cost: dist[ny][nx] });
                    }
                }
            }
        }
    }

    console.log(-1);
}

solve();
