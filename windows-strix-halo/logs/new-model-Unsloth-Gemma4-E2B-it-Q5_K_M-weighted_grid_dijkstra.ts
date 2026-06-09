const fs = require('fs');

/**
 * Simple Min Priority Queue implementation for Dijkstra's algorithm.
 * Stores elements as [cost, row, col].
 */
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    enqueue(element) {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.sinkDown(0);
        return min;
    }

    bubbleUp(index) {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index][0] < this.heap[parentIndex][0]) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    sinkDown(index) {
        const n = this.heap.length;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;

            if (leftChildIndex < n && this.heap[leftChildIndex][0] < this.heap[smallest][0]) {
                smallest = leftChildIndex;
            }

            if (rightChildIndex < n && this.heap[rightChildIndex][0] < this.heap[smallest][0]) {
                smallest = rightChildIndex;
            }

            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function solve() {
    // Read all input from stdin
    const input = fs.readFileSync(0, "utf8").trim().split('\n');

    if (input.length === 0) {
        console.log(-1);
        return;
    }

    // 1. Parse H and W
    const [H, W] = input[0].trim().split(' ').map(Number);

    // 2. Parse Grid
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].trim());
    }

    let startR = -1;
    let startC = -1;
    let targetR = -1;
    let targetC = -1;

    // Find Start (S) and Target (T)
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
        // Should not happen based on problem description, but good practice.
        console.log(-1);
        return;
    }

    // 3. Dijkstra Setup
    
    // dist[r][c] stores the minimum cost to reach (r, c)
    const INF = Number.MAX_SAFE_INTEGER;
    const dist = Array(H).fill(0).map(() => Array(W).fill(INF));
    const pq = new PriorityQueue();

    // Initial state: Start cell cost is 0.
    dist[startR][startC] = 0;
    // PQ stores [cost, r, c]
    pq.enqueue([0, startR, startC]);

    const directions = [
        [0, 1],  // Right
        [0, -1], // Left
        [1, 0],  // Down
        [-1, 0]  // Up
    ];

    // 4. Dijkstra Execution
    while (!pq.isEmpty()) {
        const [currentCost, r, c] = pq.dequeue();

        if (currentCost > dist[r][c]) {
            continue;
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
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];

                // Check for wall
                if (cell === '#') {
                    continue;
                }

                // Calculate cost to enter (nr, nc)
                let entryCost = 0;
                if (cell >= '0' && cell <= '9') {
                    entryCost = parseInt(cell, 10);
                }
                // 'S' and 'T' cost 0 to enter.

                const newCost = currentCost + entryCost;

                // Relaxation step
                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.enqueue([newCost, nr, nc]);
                }
            }
        }
    }

    // If the loop finishes without reaching the target
    console.log(-1);
}

solve();
