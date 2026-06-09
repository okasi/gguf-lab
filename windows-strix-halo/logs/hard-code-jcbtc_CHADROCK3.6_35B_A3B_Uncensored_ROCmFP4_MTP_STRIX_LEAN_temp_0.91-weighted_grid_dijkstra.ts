import * as fs from "fs";

class PriorityQueue {
    private data: { value: number; priority: number }[] = [];

    push(value: number, priority: number): void {
        this.data.push({ value, priority });
        this.data.sort((a, b) => a.priority - b.priority);
    }

    pop(): number | undefined {
        if (this.data.length === 0) return undefined;
        return this.data.shift()!.value;
    }

    peek(): number | undefined {
        if (this.data.length === 0) return undefined;
        return this.data[0].value;
    }

    get size(): number {
        return this.data.length;
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    const lines = input.filter(line => line.trim() !== "");
    
    if (lines.length < 1) {
        console.log(-1);
        return;
    }

    const firstLine = lines[0].split(/\s+/).map(Number);
    const H = firstLine[0];
    const W = firstLine[1];

    const grid: string[][] = [];
    let startRow = -1, startCol = -1, targetRow = -1, targetCol = -1;

    for (let i = 1; i <= H; i++) {
        if (i - 1 < lines.length) {
            const rowStr = lines[i - 1];
            const row: string[] = rowStr.split("");
            grid.push(row);
            for (let j = 0; j < W; j++) {
                if (row[j] === 'S') {
                    startRow = i - 1;
                    startCol = j;
                } else if (row[j] === 'T') {
                    targetRow = i - 1;
                    targetCol = j;
                }
            }
        }
    }

    if (startRow === -1 || targetRow === -1) {
        console.log(-1);
        return;
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startRow][startCol] = 0;

    const pq = new PriorityQueue();
    pq.push(startRow * W + startCol, 0);

    const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    while (pq.size > 0) {
        const curr = pq.pop();
        if (curr === undefined) break;

        const r = Math.floor(curr / W);
        const c = curr % W;

        if (r === targetRow && c === targetCol) {
            console.log(dist[r][c]);
            return;
        }

        if (dist[r][c] === Infinity) continue;

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                if (cell === '#' || cell === 'S' || cell === 'T') {
                    const cost = 0;
                    const newDist = dist[r][c] + cost;
                    if (newDist < dist[nr][nc]) {
                        dist[nr][nc] = newDist;
                        pq.push(nr * W + nc, newDist);
                    }
                } else if (cell >= '0' && cell <= '9') {
                    const cost = parseInt(cell, 10);
                    const newDist = dist[r][c] + cost;
                    if (newDist < dist[nr][nc]) {
                        dist[nr][nc] = newDist;
                        pq.push(nr * W + nc, newDist);
                    }
                }
            }
        }
    }

    if (dist[targetRow][targetCol] === Infinity) {
        console.log(-1);
    } else {
        console.log(dist[targetRow][targetCol]);
    }
}

solve();
