import * as fs from "fs";

class MinHeap {
    private heap: [number, number, number][] = [];

    push(item: [number, number, number]): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): [number, number, number] {
        if (this.heap.length === 0) throw new Error("Heap is empty");
        const top = this.heap[0];
        if (this.heap.length === 1) {
            this.heap.pop();
            return top;
        }
        const last = this.heap.pop();
        this.heap[0] = last!;
        this.bubbleDown(0);
        return top;
    }

    get length(): number {
        return this.heap.length;
    }

    get isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.heap[parent][0] <= this.heap[i][0]) break;
            [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
            i = parent;
        }
    }

    private bubbleDown(i: number): void {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
            if (right < n && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
            if (smallest === i) break;
            [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
            i = smallest;
        }
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split(/\r?\n/);
    const [H, W] = lines[0].trim().split(/\s+/).map(Number);
    const grid = lines.slice(1).map(line => line.trim().split(''));

    let startR = -1, startC = -1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startR = r;
                startC = c;
            }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => new Array(W).fill(Infinity));
    dist[startR][startC] = 0;
    const pq = new MinHeap();
    pq.push([0, startR, startC]);

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (!pq.isEmpty) {
        const [d, r, c] = pq.pop();

        if (d > dist[r][c]) continue;

        if (grid[r][c] === 'T') {
            console.log(d);
            return;
        }

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                if (grid[nr][nc] !== '#') {
                    const cost = (grid[nr][nc] >= '0' && grid[nr][nc] <= '9')
                        ? grid[nr][nc].charCodeAt(0) - 48
                        : 0;
                    const newDist = d + cost;
                    if (newDist < dist[nr][nc]) {
                        dist[nr][nc] = newDist;
                        pq.push([newDist, nr, nc]);
                    }
                }
            }
        }
    }

    console.log(-1);
}

solve();
