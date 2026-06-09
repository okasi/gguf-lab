import * as fs from 'fs';

class MinHeap<T> {
    private heap: T[] = [];
    constructor(private compare: (a: T, b: T) => number) {}
    push(val: T) {
        this.heap.push(val);
        this.bubbleUp();
    }
    pop(): T | undefined {
        if (this.size() === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.size() > 0) {
            this.heap[0] = last;
            this.sinkDown();
        }
        return top;
    }
    size() { return this.heap.length; }
    private bubbleUp() {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            let parentIdx = (idx - 1) >> 1;
            if (this.compare(this.heap[idx], this.heap[parentIdx]) >= 0) break;
            [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
            idx = parentIdx;
        }
    }
    private sinkDown() {
        let idx = 0;
        const length = this.heap.length;
        while (true) {
            let left = 2 * idx + 1;
            let right = 2 * idx + 2;
            let smallest = idx;
            if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left;
            if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right;
            if (smallest === idx) break;
            [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
            idx = smallest;
        }
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split(/\r?\n/);
    if (lines.length === 0) return;

    const firstLine = lines[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;
    const H = parseInt(firstLine[0], 10);
    const W = parseInt(firstLine[1], 10);

    const grid: string[] = [];
    for (let i = 1; i <= H; i++) {
        if (lines[i] !== undefined) {
            grid.push(lines[i].trim());
        }
    }

    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startR = r;
                startC = c;
            } else if (grid[r][c] === 'T') {
                targetR = r;
                targetC = c;
            }
        }
    }

    if (startR === -1 || targetR === -1) {
        process.stdout.write("-1\n");
        return;
    }

    const dist = Array.from({ length: H }, () => new Float64Array(W).fill(Infinity));
    const pq = new MinHeap<[number, number, number]>((a, b) => a[0] - b[0]);

    dist[startR][startC] = 0;
    pq.push([0, startR, startC]);

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (pq.size() > 0) {
        const current = pq.pop()!;
        const d = current[0];
        const r = current[1];
        const c = current[2];

        if (d > dist[r][c]) continue;
        if (r === targetR && c === targetC) {
            process.stdout.write(d.toString() + "\n");
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
                const char = grid[nr][nc];
                let weight = 0;
                if (char >= '0' && char <= '9') {
                    weight = char.charCodeAt(0) - '0'.charCodeAt(0);
                } else if (char === 'S' || char === 'T') {
                    weight = 0;
                }

                const newDist = d + weight;
                if (newDist < dist[nr][nc]) {
                    dist[nr][nc] = newDist;
                    pq.push([newDist, nr, nc]);
                }
            }
        }
    }

    process.stdout.write("-1\n");
}

solve();
