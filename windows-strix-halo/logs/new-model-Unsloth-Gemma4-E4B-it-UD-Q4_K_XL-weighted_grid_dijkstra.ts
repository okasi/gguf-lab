import * as fs from 'fs';

/**
 * Simple MinHeap implementation for use in Dijkstra's algorithm.
 * Stores elements as [cost, r, c].
 */
class MinPriorityQueue {
    private heap: [number, number, number][] = [];

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private bubbleUp(index: number): void {
        let current = index;
        while (current > 0) {
            let parent = Math.floor((current - 1) / 2);
            // Compare costs (index 0)
            if (this.heap[current][0] < this.heap[parent][0]) {
                this.swap(current, parent);
                current = parent;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        let current = index;
        const lastIndex = this.heap.length - 1;

        while (true) {
            let left = 2 * current + 1;
            let right = 2 * current + 2;
            let smallest = current;

            // Find the smallest among current, left, and right
            if (left <= lastIndex && this.heap[left][0] < this.heap[smallest][0]) {
                smallest = left;
            }
            if (right <= lastIndex && this.heap[right][0] < this.heap[smallest][0]) {
                smallest = right;
            }

            if (smallest !== current) {
                this.swap(current, smallest);
                current = smallest;
            } else {
                break;
            }
        }
    }

    enqueue(item: [number, number, number]): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    dequeue(): [number, number, number] | undefined {
        if (this.isEmpty()) return undefined;
        if (this.heap.length === 1) return this.heap.pop();
        
        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return min;
    }
}

/**
 * Solves the minimum cost path problem using Dijkstra's algorithm.
 * @param input The raw string input from stdin.
 * @returns The minimum cost, or -1 if unreachable.
 */
function solve(input: string): number {
    const lines = input.trim().split('\n');
    if (lines.length === 0) return -1;

    // 1. Parse Dimensions
    const [H, W] = lines[0].split(' ').map(Number);
    const grid = lines.slice(1).map(line => line.trim().split(''));

    let startR = -1;
    let startC = -1;
    let targetR = -1;
    let targetC = -1;

    // 2. Find Start and Target
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
        // Safety check: S or T not found
        return -1;
    }

    // 3. Dijkstra's Setup
    const INF = Infinity;
    // Initialize distances array (H x W)
    const dist: number[][] = Array(H).fill(0).map(() => Array(W).fill(INF));
    
    // Priority Queue: [cost, r, c]
    const pq = new MinPriorityQueue();

    // Start initialization
    dist[startR][startC] = 0;
    pq.enqueue([0, startR, startC]);

    // Directions: [dr, dc] -> Up, Down, Left, Right
    const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0]
    ];

    // 4. Dijkstra's Algorithm Loop
    while (!pq.isEmpty()) {
        const current = pq.dequeue()!;
        const [cost, r, c] = current;

        // Check for stale entry
        if (cost > dist[r][c]) {
            continue;
        }

        // Goal check
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

            // Determine cost of entering (nr, nc)
            let entryCost = 0;
            if (cell >= '0' && cell <= '9') {
                entryCost = parseInt(cell);
            } 
            // S and T cost 0, which is the default.

            const newCost = cost + entryCost;

            // Relaxation
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.enqueue([newCost, nr, nc]);
            }
        }
    }

    // 5. Unreachable
    return -1;
}

function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        const result = solve(input);
        console.log(result);
    } catch (e) {
        // Handle potential read errors if necessary, though for competitive programming style input, this is usually omitted.
    }
}

main();
