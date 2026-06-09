import * as fs from 'fs';

/**
 * Represents a node in the priority queue: [cost, row, col]
 */
type Node = [number, number, number];

/**
 * A simple MinPriorityQueue implementation required for Dijkstra's algorithm.
 * Stores nodes prioritized by cost (the first element).
 */
class MinPriorityQueue {
    private heap: Node[] = [];

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    /**
     * Inserts a node [cost, r, c] and maintains the heap property.
     */
    insert(node: Node): void {
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * Extracts the node with the minimum cost.
     * @returns The minimum cost node, or undefined if the heap is empty.
     */
    extractMin(): Node | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.sinkDown(0);
        return min;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const [cost, , ] = this.heap[index];
            const [parentCost, , ] = this.heap[parentIndex];

            if (cost < parentCost) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private sinkDown(index: number): void {
        const length = this.heap.length;
        const element = this.heap[index];

        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let swapIndex = index;
            let minCost = element[0];

            // Check left child
            if (leftChildIndex < length) {
                const [leftCost, , ] = this.heap[leftChildIndex];
                if (leftCost < minCost) {
                    minCost = leftCost;
                    swapIndex = leftChildIndex;
                }
            }

            // Check right child
            if (rightChildIndex < length) {
                const [rightCost, , ] = this.heap[rightChildIndex];
                if (rightCost < minCost) {
                    swapIndex = rightChildIndex;
                }
            }

            if (swapIndex !== index) {
                [this.heap[index], this.heap[swapIndex]] = [this.heap[swapIndex], this.heap[index]];
                index = swapIndex;
            } else {
                break;
            }
        }
    }
}

/**
 * Reads input from standard input and solves the minimum cost path problem using Dijkstra's algorithm.
 */
function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
        console.log(-1);
        return;
    }

    // 1. Parse H and W
    const [H_str, W_str] = lines[0].split(' ');
    const H = parseInt(H_str);
    const W = parseInt(W_str);

    // 2. Build Grid and find Start/Target coordinates
    const grid: string[][] = [];
    let startR = -1;
    let startC = -1;
    let targetR = -1;
    let targetC = -1;

    for (let i = 0; i < H; i++) {
        const row = lines[i + 1].split('');
        grid.push(row);
        for (let j = 0; j < W; j++) {
            const char = grid[i][j];
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
        console.log(-1);
        return;
    }

    // 3. Initialization for Dijkstra's
    const dist: number[][] = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    const pq = new MinPriorityQueue();

    // Start state: Cost is 0 at the starting cell
    dist[startR][startC] = 0;
    pq.insert([0, startR, startC]);

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    // 4. Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const current = pq.extractMin();
        if (!current) break;

        const [currentCost, r, c] = current;

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

            const nextCellChar = grid[nr][nc];

            // Check wall
            if (nextCellChar === '#') {
                continue;
            }

            // Determine the cost of entering the next cell (nr, nc)
            let moveCost: number;
            if (nextCellChar === 'S' || nextCellChar === 'T') {
                moveCost = 0;
            } else if (nextCellChar >= '0' && nextCellChar <= '9') {
                moveCost = parseInt(nextCellChar);
            } else {
                // Should not happen based on problem description, but safe guard
                continue;
            }

            const newCost = currentCost + moveCost;

            // Relaxation step
            if (newCost < dist[nr][nc]) {
                dist[nr][nc] = newCost;
                pq.insert([newCost, nr, nc]);
            }
        }
    }

    // 5. Target unreachable
    console.log(-1);
}

solve();
