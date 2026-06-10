import * as fs from 'fs';

class PriorityQueue<T> {
    private heap: { priority: number; value: T }[] = [];

    push(value: T, priority: number) {
        this.heap.push({ priority, value });
        this.bubbleUp();
    }

    pop(): T | undefined {
        if (this.size() === 0) return undefined;
        const top = this.heap[0].value;
        const bottom = this.heap.pop()!;
        if (this.size() > 0) {
            this.heap[0] = bottom;
            this.bubbleDown();
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    private bubbleDown() {
        let index = 0;
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let smallest = index;

            if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) smallest = left;
            if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) smallest = right;
            if (smallest === index) break;

            [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
            index = smallest;
        }
    }
}

function solve() {
    const input = fs.readFileSync(0, 'utf8').split(/\s+/);
    if (input.length < 3) return;

    const H = parseInt(input[0]);
    const W = parseInt(input[1]);
    const grid: string[] = [];
    for (let i = 0; i < H; i++) {
        grid.push(input[i + 2]);
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

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const pq = new PriorityQueue<{ r: number; c: number }>();

    dist[startR][startC] = 0;
    pq.push({ r: startR, c: startC }, 0);

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (pq.size() > 0) {
        const current = pq.pop()!;
        const { r, c } = current;
        const d = dist[r][c];

        if (r === targetR && c === targetC) {
            console.log(d);
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char === '#') continue;

                let weight = 0;
                if (char >= '0' && char <= '9') {
                    weight = parseInt(char);
                }

                if (dist[nr][nc] > d + weight) {
                    dist[nr][nc] = d + weight;
                    pq.push({ r: nr, c: nc }, dist[nr][nc]);
                }
            }
        }
    }

    console.log(-1);
}

solve();
