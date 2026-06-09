const fs = require('fs');

/**
 * Simple MinPriorityQueue implementation for Dijkstra's algorithm.
 * Stores elements as [cost, row, col].
 */
class MinPriorityQueue {
    constructor() {
        this.heap = [];
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

    isEmpty() {
        return this.heap.length === 0;
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
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;

            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex][0] < this.heap[smallest][0]) {
                smallest = leftChildIndex;
            }

            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex][0] < this.heap[smallest][0]) {
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
    // Read all input synchronously
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    
    if (input.length === 0) return;

    // Parse H and W
    const [H, W] = input[0].split(' ').map(Number);
    const grid = [];
    
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].trim().split(''));
    }

    let startR = -1;
    let startC = -1;

    // Find Start position
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startR = r;
                startC = c;
                break;
            }
        }
        if (startR !== -1) break;
    }

    if (startR === -1) return; // Should not happen based on problem constraints

    // Dijkstra Initialization
    // dist[r][c] stores the minimum cost to reach (r, c)
    const INF = Infinity;
    const dist = Array(H).fill(0).map(() => Array(W).fill(INF));
    const pq = new MinPriorityQueue();

    // Start setup: Entering 'S' costs 0.
    dist[startR][startC] = 0;
    // PQ stores [cost, row, col]
    pq.enqueue([0, startR, startC]);

    const dr = [-1, 1, 0, 0]; // Up, Down
    const dc = [0, 0, -1, 1]; // Left, Right

    while (!pq.isEmpty()) {
        const [d, r, c] = pq.dequeue();

        if (d > dist[r][c]) {
            continue;
        }

        // Target check
        if (grid[r][c] === 'T') {
            console.log(d);
            return;
        }

        // Explore neighbors
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            // Boundary check
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) {
                continue;
            }

            const cell = grid[nr][nc];

            // Wall check
            if (cell === '#') {
                continue;
            }

            // Calculate cost to enter (nr, nc)
            let costToEnter = 0;
            if (cell >= '0' && cell <= '9') {
                costToEnter = parseInt(cell, 10);
            } 
            // 'S' and 'T' cost 0 to enter.

            const newDist = d + costToEnter;

            if (newDist < dist[nr][nc]) {
                dist[nr][nc] = newDist;
                pq.enqueue([newDist, nr, nc]);
            }
        }
    }

    // If loop finishes and 'T' was not reached
    console.log(-1);
}

solve();
