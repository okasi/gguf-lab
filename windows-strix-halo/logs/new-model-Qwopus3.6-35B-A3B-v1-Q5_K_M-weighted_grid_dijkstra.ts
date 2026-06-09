import * as fs from 'fs';

class MinHeap {
    heap: { cost: number; r: number; c: number }[] = [];

    push(item: { cost: number; r: number; c: number }): void {
        this.heap.push(item);
        let i = this.heap.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.heap[parent].cost <= this.heap[i].cost) break;
            const temp = this.heap[parent];
            this.heap[parent] = this.heap[i];
            this.heap[i] = temp;
            i = parent;
        }
    }

    pop(): { cost: number; r: number; c: number } | undefined {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        let i = 0;
        while (true) {
            let left = 2 * i + 1;
            let right = 2 * i + 2;
            let smallest = i;
            if (left < this.heap.length && this.heap[left].cost < this.heap[smallest].cost) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right].cost < this.heap[smallest].cost) {
                smallest = right;
            }
            if (smallest === i) break;
            const temp = this.heap[i];
            this.heap[i] = this.heap[smallest];
            this.heap[smallest] = temp;
            i = smallest;
        }
        return top;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;

    const lines = input.split('\n');
    const [H, W] = lines[0].split(' ').map(Number);
    const grid: string[][] = lines.slice(1).map(line => line.split(''));

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

    const INF = Infinity;
    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(INF));

    const heap = new MinHeap();
    dist[startRow][startCol] = 0;
    heap.push({ cost: 0, r: startRow, c: startCol });

    const dirs: number[][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (!heap.isEmpty()) {
        const current = heap.pop()!;
        const { cost, r, c } = current;

        if (cost > dist[r][c]) continue;
        if (r === targetRow && c === targetCol) {
            console.log(cost);
            return;
        }

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
                let enterCost = 0;
                const cell = grid[nr][nc];
                if (cell >= '0' && cell <= '9') {
                    enterCost = parseInt(cell);
                }

                const newCost = cost + enterCost;
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    heap.push({ cost: newCost, r: nr, c: nc });
                }
            }
        }
    }

    console.log(-1);
}

main();
