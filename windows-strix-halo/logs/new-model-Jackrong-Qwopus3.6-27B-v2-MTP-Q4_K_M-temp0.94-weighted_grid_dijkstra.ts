import * as fs from 'fs';

function main() {
    const input = fs.readFileSync(0, 'utf8').trim().split(/\r?\n/);
    if (input.length < 1) return;
    const firstLine = input[0].trim().split(/\s+/);
    const H = parseInt(firstLine[0], 10);
    const W = parseInt(firstLine[1], 10);

    const grid: string[] = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].trim());
    }

    let sx = -1, sy = -1, tx = -1, ty = -1;
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            const ch = grid[i][j];
            if (ch === 'S') {
                sx = i; sy = j;
            } else if (ch === 'T') {
                tx = i; ty = j;
            }
        }
    }

    const dist: number[][] = Array.from({length: H}, () => Array(W).fill(Infinity));
    dist[sx][sy] = 0;

    const heap = new MinHeap<number[]>({
        compare: (a, b) => a[0] - b[0]
    });
    heap.push([0, sx, sy]);

    const dx = [-1, 1, 0, 0];
    const dy = [0, 0, -1, 1];

    while (!heap.isEmpty()) {
        const [cost, x, y] = heap.pop();
        if (cost > dist[x][y]) continue;
        if (x === tx && y === ty) {
            console.log(cost);
            return;
        }
        for (let d = 0; d < 4; d++) {
            const nx = x + dx[d];
            const ny = y + dy[d];
            if (nx < 0 || nx >= H || ny < 0 || ny >= W) continue;
            const ch = grid[nx][ny];
            if (ch === '#') continue;
            const moveCost = (ch === 'S' || ch === 'T') ? 0 : parseInt(ch, 10);
            const newCost = cost + moveCost;
            if (newCost < dist[nx][ny]) {
                dist[nx][ny] = newCost;
                heap.push([newCost, nx, ny]);
            }
        }
    }

    console.log(-1);
}

class MinHeap<T> {
    private data: T[];
    private compare: (a: T, b: T) => number;

    constructor(options: { compare: (a: T, b: T) => number }) {
        this.data = [];
        this.compare = options.compare;
    }

    push(item: T): void {
        this.data.push(item);
        this._bubbleUp(this.data.length - 1);
    }

    pop(): T {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0) {
            this.data[0] = last;
            this._bubbleDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }

    private _bubbleUp(index: number): void {
        const item = this.data[index];
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            const parent = this.data[parentIndex];
            if (this.compare(item, parent) >= 0) break;
            this.data[parentIndex] = item;
            this.data[index] = parent;
            index = parentIndex;
        }
    }

    private _bubbleDown(index: number): void {
        const length = this.data.length;
        const item = this.data[index];
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let smallest = index;
            if (left < length && this.compare(this.data[left], this.data[smallest]) < 0) {
                smallest = left;
            }
            if (right < length && this.compare(this.data[right], this.data[smallest]) < 0) {
                smallest = right;
            }
            if (smallest === index) break;
            this.data[index] = this.data[smallest];
            this.data[smallest] = item;
            index = smallest;
        }
    }
}

main();
