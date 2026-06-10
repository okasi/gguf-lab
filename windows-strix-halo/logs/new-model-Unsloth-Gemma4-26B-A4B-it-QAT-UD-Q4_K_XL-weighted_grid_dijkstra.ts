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
            this.heap[0] = { priority: bottom.priority, value: bottom.value };
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
            let swap = null;

            if (left < length) {
                if (this.heap[left].priority < this.heap[index].priority) {
                    swap = left;
                }
            }

            if (right < length) {
                if (
                    (swap === null && this.heap[right].priority < this.heap[index].priority) ||
                    (swap !== null && this.heap[right].priority < this.heap[left].priority)
                ) {
                    swap = right;
                }
            }

            if (swap === null) break;
            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
            index = swap;
        }
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    if (input.length < 2) return;

    let idx = 0;
    const H = parseInt(input[idx++]);
    const W = parseInt(input[idx++]);

    const grid: string[][] = [];
    let start: [number, number] = [-1, -1];
    let target: [number, number] = [-1, -1];

    for (let i = 0; i < H; i++) {
        const rowStr = input[idx++];
        const row: string[] = rowStr.split('');
        grid.push(row);
        for (let j = 0; j < W; j++) {
            if (row[j] === 'S') start = [i, j];
            else if (row[j] === 'T') target = [i, j];
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const pq = new MinHeap<Cell>();

    dist[start[0]][start[1]] = 0;
    pq.push(0, { r: start[0], c: start[1], cost: 0 });

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (pq.size() > 0) {
        const current = pq.pop()!;
        const { r, c } = current;

        if (current.cost > dist[r][c]) continue;
        if (r === target[0] && c === target[1]) {
            console.log(dist[r][c]);
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const char = grid[nr][nc];
                if (char === '#') continue;

                let moveCost = 0;
                if (char >= '0' && char <= '9') {
                    moveCost = parseInt(char);
                }

                if (dist[r][c] + moveCost < dist[nr][nc]) {
                    dist[nr][nc] = dist[r][c] + moveCost;
                    pq.push(dist[nr][nc], { r: nr, c: nc, cost: dist[nr][nc] });
                }
            }
        }
    }

    console.log("-1");
}

solve();
