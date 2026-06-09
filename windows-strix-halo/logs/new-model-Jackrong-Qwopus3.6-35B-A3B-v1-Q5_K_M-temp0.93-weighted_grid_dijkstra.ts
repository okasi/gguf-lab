import * as fs from "fs";

class MinHeap<T> {
    private data: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    public push(item: T): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    public pop(): T {
        const top = this.data[0];
        const end = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = end;
            this.sinkDown(0);
        }
        return top;
    }

    public isEmpty(): boolean {
        return this.data.length === 0;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.compare(this.data[i], this.data[parent]) < 0) {
                [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
                i = parent;
            } else {
                break;
            }
        }
    }

    private sinkDown(i: number): void {
        const n = this.data.length;
        while (true) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let smallest = i;

            if (left < n && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < n && this.compare(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }

            if (smallest !== i) {
                [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
                i = smallest;
            } else {
                break;
            }
        }
    }
}

const main = (): void => {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;

    const lines = input.split('\n');
    const [H, W] = lines[0].split(' ').map(Number);
    const grid: string[][] = [];
    let startRow = -1, startCol = -1;
    let targetRow = -1, targetCol = -1;

    for (let i = 0; i < H; i++) {
        const row = lines[i + 1].split('');
        grid.push(row);
        for (let j = 0; j < W; j++) {
            if (row[j] === 'S') {
                startRow = i;
                startCol = j;
            } else if (row[j] === 'T') {
                targetRow = i;
                targetCol = j;
            }
        }
    }

    const INF = Number.MAX_SAFE_INTEGER;
    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(INF));
    dist[startRow][startCol] = 0;

    const pq = new MinHeap<[number, number, number]>((a, b) => a[0] - b[0]);
    pq.push([0, startRow, startCol]);

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (!pq.isEmpty()) {
        const [cost, r, c] = pq.pop();

        if (r === targetRow && c === targetCol) {
            console.log(cost);
            return;
        }

        if (cost > dist[r][c]) {
            continue;
        }

        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;

            const cell = grid[nr][nc];
            if (cell === '#') continue;

            const enterCost = (cell === 'S' || cell === 'T') ? 0 : parseInt(cell, 10);
            const newCost = cost + enterCost;

            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.push([newCost, nr, nc]);
            }
        }
    }

    console.log(-1);
};

main();
