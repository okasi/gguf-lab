import * as fs from 'fs';

/**
 * MinHeap implementation for Dijkstra's Priority Queue.
 * Stores [cost, row, col]. Comparison is based on cost.
 */
class MinHeap {
    private heap: [number, number, number][] = [];

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private bubbleUp(index: number): void {
        let current = index;
        while (current > 0) {
            const parent = Math.floor((current - 1) / 2);
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
            let leftChild = 2 * current + 1;
            let rightChild = 2 * current + 2;
            let smallest = current;

            // Find the smallest among current, left child, and right child
            if (leftChild <= lastIndex && this.heap[leftChild][0] < this.heap[smallest][0]) {
                smallest = leftChild;
            }
            if (rightChild <= lastIndex && this.heap[rightChild][0] < this.heap[smallest][0]) {
                smallest = rightChild;
            }

            if (smallest !== current) {
                this.swap(current, smallest);
                current = smallest;
            } else {
                break;
            }
        }
    }

    insert(item: [number, number, number]): void {
        this.heap.push(item);
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

function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    
    if (input.length === 0) {
        console.log(-1);
        return;
    }

    // 1. Parse Dimensions
    const [H_str, W_str] = input[0].trim().split(' ');
    const H = parseInt(H_str);
    const W = parseInt(W_str);

    if (isNaN(H) || isNaN(W) || H <= 0 || W <= 0) {
        console.log(-1);
        return;
    }

    // 2. Parse Grid
    const grid: string[][] = [];
    for (let i = 0; i < H; i++) {
        grid.push(input[i + 1].trim().split(''));
    }

    // 3. Find Start and Target
    let start: [number, number] | null = null;
    let target: [number, number] | null = null;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (grid[r][c] === 'S') {
                start = [r, c];
            } else if (grid[r][c] === 'T') {
                target = [r, c];
            }
        }
    }

    if (!start || !target) {
        console.log(-1);
        return;
    }

    // 4. Dijkstra Initialization
    const INF = Infinity;
    const dist: number[][] = Array(H).fill(0).map(() => Array(W).fill(INF));
    const pq = new MinHeap();

    const [startR, startC] = start;
    
    dist[startR][startC] = 0;
    // PQ stores [cost, r, c]
    pq.insert([0, startR, startC]); 

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    // 5. Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const currentItem = pq.extractMin();
        if (!currentItem) break;

        const [currentCost, r, c] = currentItem;

        if (r === target[0] && c === target[1]) {
            console.log(currentCost);
            return;
        }

        if (currentCost > dist[r][c]) {
            continue; // Stale entry
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;

            // Check boundaries
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) {
                continue;
            }

            const cell = grid[nr][nc];

            // Check walls
            if (cell === '#') {
                continue;
            }

            // Calculate cost to enter the neighbor cell (nr, nc)
            let costToMove = 0;
            if (cell === 'S' || cell === 'T') {
                costToMove = 0;
            } else if (cell >= '0' && cell <= '9') {
                costToMove = parseInt(cell);
            }
            // Note: If costToMove is 0 (S/T), this handles the edge case where S/T is entered.

            const newCost = currentCost + costToMove;

            // Relaxation step
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.insert([newCost, nr, nc]);
            }
        }
    }

    // 6. Target unreachable
    console.log(-1);
}

solve();
