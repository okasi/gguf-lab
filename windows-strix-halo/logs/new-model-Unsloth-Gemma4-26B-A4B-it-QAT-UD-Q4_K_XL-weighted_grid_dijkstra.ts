import * as fs from 'fs';

interface Cell {
    r: number;
    c: number;
    cost: number;
}

class MinHeap<T> {
    private heap: { priority: number; value: T }[] = [];

    push(priority: number, value: T): void {
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

    private bubbleUp(): void {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    private bubbleDown(): void {
        let index = 0;
        const length = this.heap.length;
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let swap = -1;

            if (left < length) {
                if (this.heap[left].priority < this.heap[index].priority) {
                    swap = left;
                }
            }

            if (right < length) {
                if (
                    (swap === -1 && this.heap[right].priority < this.heap[index].priority) ||
                    (swap !== -1 && this.heap[right].priority < this.heap[left].priority)
                ) {
                    swap = right;
                }
            }

            if (swap === -1) break;
            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
            index = swap;
        }
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split(/\s+/);
    if (lines.length < 2) return;

    let idx = 0;
    const H = parseInt(lines[idx++]);
    const W = parseInt(lines[idx++]);
    
    const grid: string[][] = [];
    for (let i = 0; i < H; i++) {
        grid.push(lines[idx++].split(''));
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

    const dist = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const pq = new MinHeap<Cell>();

    dist[startR][startC] = 0;
    pq.push(0, { r: startR, c: startC, cost: 0 });

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (pq.size() > 0) {
        const current = pq.pop()!;
        const d = current.cost;

        if (d > dist[current.r][current.c]) continue;
        if (current.r === targetR && current.c === targetC) {
            console.log(d);
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nr = current.r + dr[i];
            const nc = current.c + dc[i];

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char === '#') continue;

                let stepCost = 0;
                if (char >= '0' && char <= '9') {
                    stepCost = parseInt(char);
                } else if (char === 'S' || char === 'T') {
                    stepCost = 0;
                }

                if (dist[current.r][current.c] + stepCost < dist[nr][nc]) {
                    dist[nr][nc] = dist[current.r][current.c] + stepCost;
                    pq.push(dist[nr][nc], { r: nr, c: nc, cost: dist[nr][nc] });
                }
            }
        }
    }

    console.log(-1);
}

solve();
