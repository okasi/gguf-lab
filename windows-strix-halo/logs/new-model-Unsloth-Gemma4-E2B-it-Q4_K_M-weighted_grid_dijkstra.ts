const fs = require('fs');

/**
 * A simple MinPriorityQueue implementation tailored for Dijkstra's algorithm.
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
            const parentIndex = Math.floor((index - 1) / 2);
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
            let smallest = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;

            if (leftChild <= lastIndex && this.heap[leftChild][0] < this.heap[smallest][0]) {
                smallest = leftChild;
            }
            if (rightChild <= lastIndex && this.heap[rightChild][0] < this.heap[smallest][0]) {
                smallest = rightChild;
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
    try {
        const input = fs.readFileSync(0, 'utf8').trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);

        if (input.length === 0) {
            console.log(-1);
            return;
        }

        // 1. Parse Dimensions H and W
        let lineIndex = 0;
        const [H, W] = input[lineIndex++].split(' ').map(Number);

        if (H === 0 || W === 0) {
            console.log(-1);
            return;
        }

        // 2. Parse Grid
        const grid = [];
        for (let i = 0; i < H; i++) {
            grid.push(input[lineIndex++].split(''));
        }

        let startR = -1;
        let startC = -1;
        let targetR = -1;
        let targetC = -1;

        // Find Start and Target
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
            // Should not happen based on problem constraints, but good practice
            console.log(-1);
            return;
        }

        // 3. Dijkstra Setup
        const distances = Array(H).fill(0).map(() => Array(W).fill(Infinity));
        const pq = new MinPriorityQueue();

        // Start initialization
        distances[startR][startC] = 0;
        // Priority Queue stores [cost, row, col]
        pq.enqueue([0, startR, startC]);

        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Right, Left, Down, Up

        // 4. Dijkstra Execution
        while (!pq.isEmpty()) {
            const [cost, r, c] = pq.dequeue();

            if (cost > distances[r][c]) {
                continue;
            }

            if (r === targetR && c === targetC) {
                console.log(cost);
                return;
            }

            // Explore neighbors
            for (const [dr, dc] of directions) {
                const nr = r + dr;
                const nc = c + dc;

                // Check bounds
                if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                    const cell = grid[nr][nc];

                    // Check wall
                    if (cell === '#') {
                        continue;
                    }

                    let moveCost = 0;
                    
                    // Calculate cost to enter the neighbor cell
                    if (cell >= '0' && cell <= '9') {
                        moveCost = parseInt(cell);
                    } 
                    // S and T cost 0 to enter, handled by initialization/transition cost
                    // If the neighbor is 'S' or 'T', its cost is 0.

                    const newCost = cost + moveCost;

                    if (newCost < distances[nr][nc]) {
                        distances[nr][nc] = newCost;
                        pq.enqueue([newCost, nr, nc]);
                    }
                }
            }
        }

        // If loop finishes without reaching T
        console.log(-1);

    } catch (e) {
        // Handle potential file read errors or parsing errors gracefully
        // In a strict environment, this might be omitted, but helpful for robustness.
        // console.error("An error occurred:", e);
        console.log(-1); 
    }
}

solve();
