import * as fs from 'fs';

/**
 * Helper class for Min-Heap implementation, required for Dijkstra's algorithm.
 * Stores entries as [cost, row, col].
 */
class MinPriorityQueue {
    private heap: [number, number, number][] = [];

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private parent(i: number): number { return Math.floor((i - 1) / 2); }
    private left(i: number): number { return 2 * i + 1; }
    private right(i: number): number { return 2 * i + 2; }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private bubbleUp(i: number): void {
        let current = i;
        while (current > 0) {
            const parentIndex = this.parent(current);
            // Compare costs (index 0)
            if (this.heap[current][0] < this.heap[parentIndex][0]) {
                this.swap(current, parentIndex);
                current = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleDown(i: number): void {
        let current = i;
        const lastIndex = this.heap.length - 1;

        while (true) {
            let leftIndex = this.left(current);
            let rightIndex = this.right(current);
            let smallest = current;

            // Find the smallest among current, left, and right
            if (leftIndex <= lastIndex && this.heap[leftIndex][0] < this.heap[smallest][0]) {
                smallest = leftIndex;
            }
            if (rightIndex <= lastIndex && this.heap[rightIndex][0] < this.heap[smallest][0]) {
                smallest = rightIndex;
            }

            if (smallest !== current) {
                this.swap(current, smallest);
                current = smallest;
            } else {
                break;
            }
        }
    }

    insert(cost: number, r: number, c: number): void {
        this.heap.push([cost, r, c]);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin(): [number, number, number] | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return min;
    }
}

/**
 * Solves the Minimum Cost Path problem using Dijkstra's algorithm.
 */
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0) {
        console.log(-1);
        return;
    }

    // 1. Parse dimensions
    const [H, W] = input[0].trim().split(/\s+/).map(Number);
    const grid: string[][] = [];
    
    let startR = -1;
    let startC = -1;
    let targetR = -1;
    let targetC = -1;

    // 2. Parse grid and find S, T
    for (let i = 0; i < H; i++) {
        const row = input[i + 1].split('');
        grid.push(row);
        for (let j = 0; j < W; j++) {
            const char = row[j];
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
        // Should not happen based on problem description, but good practice
        console.log(-1);
        return;
    }

    // 3. Dijkstra Initialization
    const INF = Number.MAX_SAFE_INTEGER;
    const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(INF));
    const pq = new MinPriorityQueue();

    // Cost to enter S is 0.
    dist[startR][startC] = 0;
    pq.insert(0, startR, startC);

    // Directions: [dr, dc] (Up, Down, Left, Right)
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    // 4. Dijkstra's Algorithm Execution
    while (!pq.isEmpty()) {
        const result = pq.extractMin();
        if (!result) break;
        
        const [currentCost, r, c] = result;

        if (currentCost > dist[r][c]) {
            continue; // Stale entry
        }

        // Check if we reached the target
        if (r === targetR && c === targetC) {
            console.log(currentCost);
            return;
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;

            // Check bounds
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) {
                continue;
            }

            const cell = grid[nr][nc];

            // Check for walls
            if (cell === '#') {
                continue;
            }

            // Calculate cost to enter neighbor (nr, nc)
            let moveCost = 0;
            if (cell !== 'S' && cell !== 'T') {
                // Cell is a digit 0-9
                moveCost = parseInt(cell);
            }
            // If cell is S or T, moveCost is 0

            const newCost = currentCost + moveCost;

            // Relaxation step
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.insert(newCost, nr, nc);
            }
        }
    }

    // 5. Target unreachable
    console.log(-1);
}

solve();
