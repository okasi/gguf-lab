const fs = require('fs');

/**
 * Finds the minimum cost path in a rectangular grid using Dijkstra's algorithm.
 */
function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');

    if (input.length === 0) return;

    // Parse H and W
    const [H, W] = input[0].trim().split(/\s+/).map(Number);

    if (H === 0 || W === 0) {
        console.log(-1);
        return;
    }

    // Parse grid
    const grid = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].trim().split(''));
    }

    let start = null;
    let target = null;

    // Find start and target
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
        // Should not happen based on problem description, but handle defensively
        console.log(-1);
        return;
    }

    // Dijkstra's Algorithm setup
    const INF = Infinity;
    // dist[r][c] stores the minimum cost to reach cell (r, c)
    const dist = Array(H).fill(0).map(() => Array(W).fill(INF));
    // Priority Queue stores [cost, row, col]
    // We use a simple array simulation for the PQ and sort it, 
    // as a proper binary heap implementation is complex in a single file submission, 
    // though less efficient. For competitive programming style, this is often accepted 
    // if constraints are small, but we'll implement a basic min-priority-queue logic.

    // Simple Min-Heap structure for the Priority Queue
    class PriorityQueue {
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
            this.bubbleDown(0);
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

        bubbleDown(index) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (left < this.heap.length && this.heap[left][0] < this.heap[smallest][0]) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right][0] < this.heap[smallest][0]) {
                smallest = right;
            }

            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                this.bubbleDown(smallest);
            }
        }
    }

    const pq = new PriorityQueue();

    // Initialize start node
    dist[start.r][start.c] = 0;
    // Priority Queue stores [cost, r, c]
    pq.enqueue([0, start.r, start.c]);

    const dr = [-1, 1, 0, 0]; // Up, Down, Left, Right
    const dc = [0, 0, -1, 1];

    while (!pq.isEmpty()) {
        const [d, r, c] = pq.dequeue();

        // If we found a path longer than the recorded minimum, skip
        if (d > dist[r][c]) continue;

        if (r === target.r && c === target.c) {
            console.log(d);
            return;
        }

        // Explore neighbors
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];

            // Check bounds
            if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
                const cell = grid[nr][nc];

                // Check for wall
                if (cell === '#') continue;

                let cost = 0;
                if (cell >= '0' && cell <= '9') {
                    cost = parseInt(cell);
                } else if (cell === 'S' || cell === 'T') {
                    // Entering S or T costs 0, cost is already handled by initial distance setup, 
                    // but for consistency in transition:
                    cost = 0;
                } else {
                    // Should not happen if input is valid, but treat unknown as wall or ignore
                    continue;
                }

                const newDist = d + cost;

                if (newDist < dist[nr][nc]) {
                    dist[nr][nc] = newDist;
                    pq.enqueue([newDist, nr, nc]);
                }
            }
        }
    }

    // If target is never reached
    console.log(-1);
}

solve();
