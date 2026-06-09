import * as fs from "fs";

class MinHeap<T> {
    private heap: T[] = [];

    push(item: T): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.less(i, parent)) {
                this.swap(i, parent);
                i = parent;
            } else {
                break;
            }
        }
    }

    private sinkDown(i: number): void {
        const n = this.heap.length;
        while (true) {
            let left = 2 * i + 1;
            let right = 2 * i + 2;
            let smallest = i;
            if (left < n && this.less(left, smallest)) smallest = left;
            if (right < n && this.less(right, smallest)) smallest = right;
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            } else {
                break;
            }
        }
    }

    private less(i: number, j: number): boolean {
        return this.heap[i][0] < this.heap[j][0];
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split("\n");
    const [H, W] = lines[0].trim().split(/\s+/).map(Number);

    const grid: string[][] = [];
    let sx = -1, sy = -1, tx = -1, ty = -1;

    for (let i = 1; i <= H; i++) {
        const line = lines[i].trim();
        const row: string[] = [];
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            row.push(char);
            if (char === 'S') {
                sx = j;
                sy = i - 1;
            } else if (char === 'T') {
                tx = j;
                ty = i - 1;
            }
        }
        grid.push(row);
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    dist[sy][sx] = 0;

    // [cost, x, y]
    const pq = new MinHeap<[number, number, number]>();
    pq.push([0, sx, sy]);

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (pq.size() > 0) {
        const current = pq.pop()!;
        const [cost, x, y] = current;

        if (cost > dist[y][x]) continue;
        if (x === tx && y === ty) {
            console.log(cost);
            return;
        }

        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < W && ny >= 0 && ny < H && grid[ny][nx] !== '#') {
                const char = grid[ny][nx];
                const stepCost = char === 'S' || char === 'T' ? 0 : parseInt(char, 10);

                if (cost + stepCost < dist[ny][nx]) {
                    dist[ny][nx] = cost + stepCost;
                    pq.push([dist[ny][nx], nx, ny]);
                }
            }
        }
    }

    console.log(-1);
}

solve();
