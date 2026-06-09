const fs = require('fs');

/**
 * Simple MinPriorityQueue implementation for Dijkstra's algorithm.
 * Stores elements as [cost, row, col].
 */
class MinPriorityQueue {
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
        this.bubbleDown(0);
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

    bubbleDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallestIndex = index;

            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex][0] < this.heap[smallestIndex][0]) {
                smallestIndex = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex][0] < this.heap[smallestIndex][0]) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex !== index) {
                [this.heap[index], this.heap[smallestIndex]] = [this.heap[smallestIndex], this.heap[index]];
                index = smallestIndex;
            } else {
                break;
            }
        }
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    
    if (input.length === 0) return;

    // 1. Parse H and W
    const [H, W] = input[0].trim().split(' ').map(Number);

    // 2. Parse Grid
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].trim().split(''));
    }

    let start = null;
    let target = null;

    // 3. Find Start and Target positions
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                start = { r, c };
            } else if (grid[r][c] === 'T') {
                target = { r, c };
            }
        }
    }

    if (!start || !target) {
        // Should not happen based on problem description, but good practice
        console.log(-1);
        return;
    }

    // 4. Initialize Dijkstra's structures
    const INF = Infinity;
    // dist[r][c] stores the minimum cost to reach (r, c)
    const dist = Array(H).fill(0).map(() => Array(W).fill(INF));
    
    const pq = new MinPriorityQueue();

    // Start cost is 0. The cost of entering S is 0.
    dist[start.r][start.c] = 0;
    pq.enqueue([0, start.r, start.c]);

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    // 5. Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const [currentCost, r, c] = pq.dequeue();

        if (currentCost > dist[r][c]) {
            continue;
        }

        if (r === target.r && c === target.c) {
            console.log(currentCost);
            return;
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;

            // Check boundaries
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];

                // Check for wall
                if (cell === '#') {
                    continue;
                }

                // Determine the cost of entering the new cell (nr, nc)
                let entryCost;
                if (cell === 'S' || cell === 'T') {
                    entryCost = 0;
                } else if (cell >= '0' && cell <= '9') {
                    // Convert digit character to integer cost
                    entryCost = parseInt(cell, 10);
                } else {
                    // Should not happen if input is clean
                    continue;
                }

                const newCost = currentCost + entryCost;

                if (newCost < dist[nr][nc]) {
                    dist[nr][nc] = newCost;
                    pq.enqueue([newCost, nr, nc]);
                }
            }
        }
    }

    // If the loop finishes and the target was not reached
    console.log(-1);
}

solve();
