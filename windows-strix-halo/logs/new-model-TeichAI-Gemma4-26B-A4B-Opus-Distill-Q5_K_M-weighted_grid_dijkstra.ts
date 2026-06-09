import * as fs from 'fs';

class PriorityQueue<T> {
    private heap: T[] = [];
    private comparator: (a: T, b: T) => number;

    constructor(comparator: (a: T, b: T) => number) {
        this.comparator = comparator;
    }

    push(val: T) {
        this.heap.push(val);
        this.bubbleUp();
    }

    pop(): T | undefined {
        if (this.isEmpty()) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return top;
    }

    isEmpty() { return this.heap.length === 0; }

    private bubbleUp() {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            const parent = (idx - 1) >> 1;
            if (this.comparator(this.heap[idx], this.heap[parent]) < 0) {
                [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
                idx = parent;
            } else break;
        }
    }

    private bubbleDown() {
        let idx = 0;
        const length = this.heap.length;
        while (true) {
            let smallest = idx;
            const left = (idx << 1) + 1;
            const right = (idx << 1) + 2;
            if (left < length && this.comparator(this.heap[left], this.heap[smallest]) < 0) smallest = left;
            if (right < length && this.comparator(this.heap[right], this.heap[smallest]) < 0) smallest = right;
            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            } else break;
        }
    }
}

function solve() {
    const inputStr = fs.readFileSync(0, 'utf8');
    const tokens = inputStr.split(/\s+/).filter(s => s.length > 0);
    if (tokens.length < 2) return;

    const H = parseInt(tokens[0], 10);
    const W = parseInt(tokens[1], 10);
    if (isNaN(H) || isNaN(W)) return;

    const gridStr = tokens.slice(2).join('');
    if (gridStr.length < H * W) return;

    const grid: string[][] = [];
    let startR = -1, startC = -1, targetR = -1, targetC = -1;

    for (let i = 0; i < H; i++) {
        grid[i] = [];
        for (let j = 0; j < W; j++) {
            const char = gridStr[i * W + j];
            grid[i].push(char);
            if (char === 'S') {
                startR = i;
                startC = j;
            } else if (char === 'T') {
                targetR = i;
                targetC = j;
            }
        }
    }

    if (startR === -1 || targetR === -1) {
        console.log(-1);
        return;
    }

    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const pq = new PriorityQueue<{ r: number, c: number, cost: number }>((a, b) => a.cost - b.cost);

    dist[startR][startC] = 0;
    pq.push({ r: startR, c: startC, cost: 0 });

    const dr = [0, 0, 1, -1];
    const dc = [1, -1, 0, 0];

    while (!pq.isEmpty()) {
        const curr = pq.pop()!;
        if (curr.cost > dist[curr.r][curr.c]) continue;
        if (curr.r === targetR && curr.c === targetC) {
            console.log(curr.cost);
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nr = curr.r + dr[i];
            const nc = curr.c + dc[i];

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char === '#') continue;

                let entryCost = 0;
                if (char >= '0' && char <= '9') {
                    entryCost = parseInt(char, 10);
                } else if (char === 'S' || char === 'T') {
                    entryCost = 0;
                }

                if (dist[curr.r][curr.c] + entryCost < dist[nr][nc]) {
                    dist[nr][nc] = dist[curr.r][curr.c] + entryCost;
                    pq.push({ r: nr, c: nc, cost: dist[nr][nc] });
                }
            }
        }
    }

    console.log(-1);
}

solve();
