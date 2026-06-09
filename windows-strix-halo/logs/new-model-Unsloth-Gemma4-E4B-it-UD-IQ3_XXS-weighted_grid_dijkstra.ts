import * as fs from 'fs';

// --- Priority Queue Implementation (Min Heap) ---
// We need a min-heap implementation for Dijkstra's algorithm
class PriorityQueue {
    private heap: [number, number, number][] = []; // [cost, r, c]

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    insert(cost: number, r: number, c: number): void {
        this.heap.push([cost, r, c]);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin(): [number, number, number] | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        const minElement = this.heap[0];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.bubbleDown(0);
        return minElement;
    }

    private bubbleUp(index: number): void {
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

    private bubbleDown(index: number): void {
        const heapSize = this.heap.length;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallestIndex = index;

            if (leftChildIndex < heapSize && this.heap[leftChildIndex][0] < this.heap[smallestIndex][0]) {
                smallestIndex = leftChildIndex;
            }
            if (rightChildIndex < heapSize && this.heap[rightChildIndex][0] < this.heap[smallestIndex][0]) {
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

// --- Main Logic ---

function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0) {
        console.log(-1);
        return;
    }

    const [H_str, W_str] = input[0].split(' ');
    const H = parseInt(H_str);
    const W = parseInt(W_str);

    const grid: string[][] = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].split('');
    }

    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                startR = r;
                startC = c;
            }
            if (grid[r][c] === 'T') {
                targetR = r;
                targetC = c;
            }
        }
    }

    // Distance array initialized to Infinity
    const INF = Number.MAX_SAFE_INTEGER;
    const dist: number[][] = Array(H).fill(0).map(() => Array(W).fill(INF));

    const pq = new PriorityQueue();

    // Start Dijkstra's
    dist[startR][startC] = 0;
    pq.insert(0, startR, startC);

    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    while (!pq.isEmpty()) {
        const [currentCost, r, c] = pq.extractMin() as [number, number, number];

        if (currentCost > dist[r][c]) {
            continue;
        }

        // Check if target reached
        if (grid[r][c] === 'T') {
            console.log(currentCost);
            return;
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr < 0 || nr >= H || nc < 0 || nc >= W) {
                continue;
            }

            const nextCell = grid[nr][nc];

            if (nextCell === '#') {
                continue; // Wall
            }

            // Determine cost of entering the neighbor cell
            let moveCost = 0;
            if (nextCell === 'S' || nextCell === 'T') {
                moveCost = 0;
            } else if (nextCell >= '0' && nextCell <= '9') {
                // Convert character digit to number cost
                moveCost = parseInt(nextCell);
            } else {
                // Should not happen if logic is sound, but treat unknown characters as impassable or handle error
                continue;
            }

            const newCost = currentCost + moveCost;

            // Relaxation step
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.insert(newCost, nr, nc);
            }
        }
    }

    // If the target was never reached
    console.log(-1);
}

solve();
