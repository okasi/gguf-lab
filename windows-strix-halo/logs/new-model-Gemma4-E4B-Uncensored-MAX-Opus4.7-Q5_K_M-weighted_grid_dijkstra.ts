import * as fs from 'fs';
import * as path from 'path';

/**
 * Priority Queue implemented as a min-heap.
 * Stores [cost, r, c] tuples, prioritizing lower cost.
 */
class MinHeap {
    private heap: [number, number, number][];

    constructor() {
        this.heap = [];
    }

    size(): number {
        return this.heap.length;
    }

    private getParentIndex(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private getLeftChildIndex(i: number): number {
        return 2 * i + 1;
    }

    private getRightChildIndex(i: number): number {
        return 2 * i + 2;
    }

    private getPriority(i: number): number {
        return this.heap[i][0];
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[i], this.heap[j]];
    }

    private bubbleUp(index: number): void {
        let currentIndex = index;
        while (this.getParentIndex(currentIndex) >= 0 && this.heap[this.getParentIndex(currentIndex)]?.[0] > this.heap[currentIndex]?.[0]!) {
            const parentIndex = this.getParentIndex(currentIndex);
            this.swap(parentIndex, currentIndex);
            currentIndex = this.getParentIndex(currentIndex);
        }
    }

    private bubbleDown(index: number): void {
        let currentIndex = index;
        while (true) {
            const leftIndex = this.getLeftChildIndex(currentIndex);
            const rightIndex = this.getRightChildIndex(currentIndex);
            let smallest = currentIndex;

            const left = this.heap[this.getLeftChildIndex(currentIndex)]?.[0];
            const right = this.heap[this.getRightChildIndex(currentIndex)]?.[0];

            if (left !== undefined && this.heap[this.getLeftChildIndex(currentIndex)]?.[0]! < this.heap[this.heap[this.getLeftChildIndex(currentIndex)]!][0]!) {
                smallest = this.getLeftChildIndex(currentIndex);
            }

            if (right !== undefined && this.heap[this.heap[this.getRightChildIndex(currentIndex)]!][0]! < this.heap[this.heap[this.getRightChildIndex(currentIndex)]!][0]!) {
                smallest = this.getRightChildIndex(currentIndex);
            }

            if (smallest === currentIndex) {
                break;
            }

            this.swap(currentIndex, smallest);
            currentIndex = smallest;
        }
    }

    public insert(item: [number, number, number]): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    public extractMin(): [number, number, number] | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        const min = this.heap[0];
        const min = this.heap.pop()!;
        this.heap[0] = this.heap.shift()!;
        this.bubbleDown(0);
        return min;
    }

    public isEmpty(): boolean {
        return this.heap.length === 0;
    }
}

/**
 * Solves the Grid Shortest Path problem using Dijkstra's algorithm.
 */
function solve(input: string): number | -1 {
    const lines = input.trim().split('\n');
    if (lines.length === 0) return -1;

    const [H, W] = lines[0].split(' ').map(Number);
    const grid = lines.slice(1).map(line => Array.from(line)));

    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;

    // 1. Locate S and T
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const cell = grid[r][c];
            if (cell === 'S') {
                startR = r;
                startC = c;
            } else if (cell === 'T') {
                targetR = r;
                targetC = c;
            }
        }
    }

    if (startR === -1 || targetR === -1) {
        // Should not happen based on problem statement
        return -1;
    }

    // 2. Initialization
    const dist: number[][] = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    const pq = new MinHeap();

    dist[startR][startC] = 0;
    pq.insert([0, startR, startC]);

    // 3. Dijkstra's algorithm
    const directions: [number, number][] = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];

    while (!pq.isEmpty()) {
        const [cost, r, c] = pq.extractMin()!;

        if (cost > dist[r][c]) {
            continue; // Stale entry
        }

        // Target reached
        if (r === targetR && c === targetC) {
            return cost;
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;

            // Bounds check
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) {
                continue;
            }

            const cell = grid[nr][nc];
            // Wall check
            if (cell === '#') {
                continue;
            }

            let stepCost = 0;
            if (cell >= '0' && cell <= '9') {
                stepCost = parseInt(cell);
            }
            // S/T cost is 0, already handled by default.

            const newCost = cost + stepCost;

            // Relaxation
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.insert([newCost, nr, nc]);
            }
        }
    }

    return -1; // Target unreachable
}

/**
 * Main execution function.
 */
function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        const result = solve(input);
        console.log(result);
    } catch (error) {
        // Handle file reading errors gracefully
        console.error("Error reading input:", error);
        process.exit(1);
    }
}

main();
