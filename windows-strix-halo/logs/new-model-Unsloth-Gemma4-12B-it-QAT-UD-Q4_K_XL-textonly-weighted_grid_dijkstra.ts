import * as fs from 'fs';

function solve() {
    const input = fs.readFileSync(0, 'utf8').split(/\r?\n/);
    if (input.length === 0) return;

    const firstLine = input[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;

    const H = parseInt(firstLine[0]);
    const W = parseInt(firstLine[1]);

    const grid = [];
    let start: [number, number] = [0, 0];
    let target: [number, number] = [0, 0];

    for (let i = 0; i < H; i++) {
        const row = input[i + 1].trim().split('');
        grid.push(row);
        for (let j = 0; j < W; j++) {
            if (row[j] === 'S') {
                start = [i, j];
            } else if (row[j] === 'T') {
                target = [i, j];
            }
        }
    }

    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
    
    // Simple Min-Priority Queue implementation (Binary Heap)
    class PriorityQueue {
        private heap: { cost: number; r: number; c: number }[] = [];
        push(cost: number, r: number, c: number) {
            this.heap.push({ cost, r, c });
            this.bubbleUp();
        }
        pop() {
            if (this.size() === 0) return null;
            const min = this.heap[0];
            const last = this.heap.pop()!;
            if (this.size() > 0) {
                this.heap[0] = last;
                this.bubbleDown();
            }
            return min;
        }
        size() { return this.heap.length; }
        private bubbleUp() {
            let idx = this.heap.length - 1;
            while (idx > 0) {
                let parentIdx = Math.floor((idx - 1) / 2);
                if (this.heap[idx].cost < this.heap[parentIdx].cost) {
                    [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                    idx = parentIdx;
                } else break;
            }
        }
        private bubbleDown() {
            let idx = 0;
            while (true) {
                let left = 2 * idx + 1;
                let right = 2 * idx + 2;
                let smallest = idx;
                if (left < this.heap.length && this.heap[left].cost < this.heap[smallest].cost) smallest = left;
                if (right < this.heap.length && this.heap[right].cost < this.heap[smallest].cost) smallest = right;
                if (smallest !== idx) {
                    [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                    idx = smallest;
                } else break;
            }
        }
    }

    const pq = new PriorityQueue();
    dist[start[0]][start[1]] = 0;
    pq.push(0, start[0], start[1]);

    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];

    while (pq.size() > 0) {
        const { cost, r, c } = pq.pop()!;

        if (cost > dist[r][c]) continue;
        if (r === target[0] && c === target[1]) {
            process.stdout.write(cost.toString() + '\n');
            return;
        }

        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            if (nr >= 0 && nr < H && nc >= 0 && nc < W && grid[nr][nc] !== '#') {
                let moveCost = 0;
                const cell = grid[nr][nc];
                if (cell >= '0' && cell <= '9') {
                    moveCost = parseInt(cell);
                }

                if (dist[r][c] + moveCost < dist[nr][nc]) {
                    dist[nr][nc] = dist[r][c] + moveCost;
                    pq.push(dist[nr][nc], nr, nc);
                }
            }
        }
    }

    process.stdout.write('-1\n');
}

solve();
