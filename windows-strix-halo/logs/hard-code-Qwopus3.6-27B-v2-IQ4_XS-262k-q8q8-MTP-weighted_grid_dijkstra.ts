import fs from 'fs';

function main() {
    const data = fs.readFileSync(0, "utf8").trim();
    const lines = data.split(/\r?\n/);
    const [H, W] = lines[0].split(" ").map(Number);
    const grid: string[] = [];
    for (let i = 1; i <= H; i++) {
        grid.push(lines[i]);
    }

    let startY = -1;
    let startX = -1;
    let targetY = -1;
    let targetX = -1;

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (grid[y][x] === 'S') {
                startY = y;
                startX = x;
            } else if (grid[y][x] === 'T') {
                targetY = y;
                targetX = x;
            }
        }
    }

    const INF = Number.MAX_SAFE_INTEGER;
    const dist: number[][] = Array.from({ length: H }, () => new Array(W).fill(INF));
    dist[startY][startX] = 0;

    const pq: [number, number, number][] = []; // [cost, y, x]
    pq.push([0, startY, startX]);

    const dy = [-1, 1, 0, 0];
    const dx = [0, 0, -1, 1];

    while (pq.length > 0) {
        // Find the element with the minimum cost (simple linear search since we are not using a heap library)
        // To optimize, we can use a proper priority queue, but for H*W <= 300,000, a simple array with sorting or a heap is better.
        // Let's implement a simple min-heap for efficiency.
    }

    // Re-implementing with a proper Min-Heap for Dijkstra
    class MinHeap {
        private heap: [number, number, number][] = [];

        push(cost: number, y: number, x: number) {
            this.heap.push([cost, y, x]);
            this._bubbleUp(this.heap.length - 1);
        }

        pop(): [number, number, number] | undefined {
            if (this.heap.length === 0) return undefined;
            const top = this.heap[0];
            const bottom = this.heap.pop();
            if (bottom && this.heap.length > 0) {
                this.heap[0] = bottom;
                this._bubbleDown(0);
            }
            return top;
        }

        isEmpty(): boolean {
            return this.heap.length === 0;
        }

        private _bubbleUp(idx: number) {
            const val = this.heap[idx];
            while (idx > 0) {
                const parentIdx = Math.floor((idx - 1) / 2);
                const parent = this.heap[parentIdx];
                if (val[0] >= parent[0]) break;
                this.heap[idx] = parent;
                idx = parentIdx;
            }
            this.heap[idx] = val;
        }

        private _bubbleDown(idx: number) {
            const val = this.heap[idx];
            const length = this.heap.length;
            while (true) {
                let leftChildIdx = 2 * idx + 1;
                let rightChildIdx = 2 * idx + 2;
                let swapIdx = null;

                if (leftChildIdx < length) {
                    if (this.heap[leftChildIdx][0] < val[0]) {
                        swapIdx = leftChildIdx;
                    }
                }
                if (rightChildIdx < length) {
                    if (this.heap[rightChildIdx][0] < val[0]) {
                        if (swapIdx === null || this.heap[rightChildIdx][0] < this.heap[leftChildIdx][0]) {
                            swapIdx = rightChildIdx;
                        }
                    } else if (swapIdx === null && this.heap[leftChildIdx][0] < val[0]) {
                        swapIdx = leftChildIdx;
                    }
                }

                if (swapIdx === null) break;
                this.heap[idx] = this.heap[swapIdx];
                idx = swapIdx;
            }
            this.heap[idx] = val;
        }
    }

    const pq2 = new MinHeap();
    pq2.push(0, startY, startX);

    const visited: boolean[][] = Array.from({ length: H }, () => new Array(W).fill(false));

    while (!pq2.isEmpty()) {
        const [cost, y, x] = pq2.pop()!;

        if (visited[y][x]) continue;
        visited[y][x] = true;

        if (y === targetY && x === targetX) {
            console.log(cost);
            return;
        }

        for (let i = 0; i < 4; i++) {
            const ny = y + dy[i];
            const nx = x + dx[i];

            if (ny < 0 || ny >= H || nx < 0 || nx >= W) continue;
            if (visited[ny][nx]) continue;
            if (grid[ny][nx] === '#') continue;

            let moveCost = 0;
            const cell = grid[ny][nx];
            if (cell >= '0' && cell <= '9') {
                moveCost = parseInt(cell, 10);
            }
            // S and T cost 0

            const newCost = cost + moveCost;
            if (newCost < dist[ny][nx]) {
                dist[ny][nx] = newCost;
                pq2.push(newCost, ny, nx);
            }
        }
    }

    console.log(-1);
}

main();
