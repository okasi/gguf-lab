import * as fs from 'fs';

class MinHeap {
    private data: [number, number, number][] = [];

    push(item: [number, number, number]): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): [number, number, number] | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    get length(): number {
        return this.data.length;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parentIndex = Math.floor((i - 1) / 2);
            if (this.data[parentIndex][0] <= this.data[i][0]) break;
            [this.data[parentIndex], this.data[i]] = [this.data[i], this.data[parentIndex]];
            i = parentIndex;
        }
    }

    private bubbleDown(i: number): void {
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < this.data.length && this.data[left][0] < this.data[smallest][0]) {
                smallest = left;
            }
            if (right < this.data.length && this.data[right][0] < this.data[smallest][0]) {
                smallest = right;
            }

            if (smallest === i) break;
            [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
            i = smallest;
        }
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split('\n');
    const [H, W] = lines[0].split(' ').map(Number);
    const grid = lines.slice(1, H + 1);

    let startRow = -1, startCol = -1;
    let targetRow = -1, targetCol = -1;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startRow = r; startCol = c;
            } else if (grid[r][c] === 'T') {
                targetRow = r; targetCol = c;
            }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[startRow][startCol] = 0;

    const pq = new MinHeap();
    pq.push([0, startRow, startCol]);

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (pq.length > 0) {
        const [cost, r, c] = pq.pop()!;

        if (r === targetRow && c === targetCol) {
            console.log(cost);
            return;
        }

        if (cost > dist[r][c]) continue;

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];
                if (cell !== '#') {
                    const weight = cell === 'S' || cell === 'T' ? 0 : parseInt(cell, 10);
                    const newCost = cost + weight;
                    if (newCost < dist[nr][nc]) {
                        dist[nr][nc] = newCost;
                        pq.push([newCost, nr, nc]);
                    }
                }
            }
        }
    }

    console.log(-1);
}

main();
