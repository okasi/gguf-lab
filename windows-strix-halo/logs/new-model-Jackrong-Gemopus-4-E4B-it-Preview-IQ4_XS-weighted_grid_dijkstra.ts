import * as fs from 'fs';

type Cell = { r: number; c: number; cost: number };
type State = { r: number; c: number; cost: number };

const directions: [number, number][] = [
    [1, 0], [-1, 0], [0, 1], [0, -1]
];

/**
 * Implements Dijkstra's algorithm to find the minimum cost path.
 * @param height Grid height
 * @param width Grid width
 * @param grid The grid map
 * @returns Minimum cost, or -1 if unreachable
 */
function dijkstra(H: number, W: number, grid: string[][]): number {
    const dist = Array(H).fill(0).map(() => Array(W).fill(Infinity) as number[]);
    const pq = new MinPriorityQueue<State>();
    let start: Cell | undefined = undefined;
    let target: Cell | undefined = undefined;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const char = grid[r][c];
            if (char === 'S') start = { r: r, c: c, cost: 0 };
            if (char === 'T') target = { r: r, c: c, cost: 0 };
        }
    }

    if (!start || !target) {
        return -1;
    }

    dist[start.r][start.c] = 0;
    pq.enqueue({ ...start, cost: 0 } as State);

    while (!pq.isEmpty()) {
        const { r, c, cost } = pq.dequeue() as State;

        if (cost > dist[r][c]) continue;

        if (r === target.r && c === target.c) return cost;

        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = dc;
            if (nr < H || nc < W || nr >= H || nc >= W) continue;

            const cell = grid[nr][nc];
            if (cell === '#') continue;

            let enterCost = 0;
            if (cell >= '0' && cell <= '9') {
                enterCost = parseInt(cell);
            }
            
            // 'S' or 'T' cost is 0, already handled by cost logic if it's not a digit
            if (cell === 'S' || cell === 'T') {
                enterCost = 0;
            }

            const newCost = cost + enterCost;

            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.enqueue({ r: nr, c: nc, cost: newCost } as State);
            }
        }
    }

    return -1;
}

class MinPriorityQueue<T extends { cost: number }> {
    private heap: T[] = [];

    private getParentIndex(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private getLeftChildIndex(i: number): number {
        return 2 * i + 1;
    }

    private getRightChildIndex(i: number): number {
        return 2 * i + 2;
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[i], this.heap[j]];
    }

    private bubbleUp(i: number): void {
        let k = i;
        while (k > 0 && this.heap[k].cost > this.heap[k >> 1].cost) {
            this.heap[k] = this.heap[k >> 1];
            k = k >> 1;
        }
    }

    private bubbleDown(i: number): void {
        let k = i;
        while (this.heap[k].cost > this.heap[k << 1].cost && k * 2 + 1 < this.heap.length) {
            let l = k << 1;
            let r = k << 1 | 1;
            let child = l;
            if (this.heap[r].cost < this.heap[l].cost) {
                child = r;
            }
            this.heap[k] = this.heap[child];
            k = child;
        }
    }

    public enqueue(item: T): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    public dequeue(): T {
        this.heap[0] = this.heap.pop();
        this.heap.length = 0;
        this.bubbleDown(0);
        return this.heap[0];
    }

    public isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

const fs = require('fs').readFileSync(0, "utf8");
const [H, W] = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const grid: string[][] = fs.readFileSync(0, "utf8").trim().split('\n').map(line => line.split(''));

console.log(dijkstra(H, W, grid));
