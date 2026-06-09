import * as fs from 'fs';

// Define a structure for the state in the priority queue
interface State {
    cost: number;
    r: number;
    c: number;
}

// Minimal implementation of a Min-Heap for Dijkstra's
class MinPriorityQueue {
    private heap: State[] = [];

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    insert(state: State): void {
        this.heap.push(state);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin(): State | undefined {
        if (this.heap.length === 0) {
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

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].cost < this.heap[parentIndex].cost) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;

            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex].cost < this.heap[smallest].cost) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex].cost < this.heap[smallest].cost) {
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

/**
 * Determines the cost to enter a cell.
 * S and T cost 0. Digits cost their value. Walls are impassable.
 */
function getCellCost(char: string): number {
    if (char === 'S' || char === 'T') {
        return 0;
    }
    if (char === '#') {
        return Infinity; // Effectively blocked
    }
    if (char >= '0' && char <= '9') {
        return parseInt(char);
    }
    return 0; // Should not happen based on problem description
}

function solve(): number {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    
    if (input.length === 0) return -1;

    // 1. Parse Dimensions and Grid
    const [H, W] = input[0].split(' ').map(Number);
    const grid: string[][] = [];
    for (let i = 1; i <= H; i++) {
        grid.push(input[i].split(''));
    }

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

    // Check if S or T were found (safety check)
    if (startR === -1 || targetR === -1) {
        return -1;
    }

    // 3. Dijkstra Initialization
    const distances: number[][] = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    const pq = new MinPriorityQueue();

    // Start cost is 0
    distances[startR][startC] = 0;
    pq.insert({ cost: 0, r: startR, c: startC });

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    // 4. Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const current = pq.extractMin()!;
        const { cost: currentCost, r: r, c: c } = current;

        if (currentCost > distances[r][c]) {
            continue; // Stale entry
        }

        // Check if we reached the target
        if (r === targetR && c === targetC) {
            return currentCost;
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;

            // Check bounds
            if (nr < 0 || nr >= H || nc < 0 || nc >= W) {
                continue;
            }

            const cellChar = grid[nr][nc];
            const entryCost = getCellCost(cellChar);
            
            if (entryCost === Infinity) {
                continue; // Wall
            }

            const newCost = currentCost + entryCost;

            // Relaxation step
            if (newCost < distances[nr][nc]) {
                distances[nr][nc] = newCost;
                pq.insert({ cost: newCost, r: nr, c: nc });
            }
        }
    }

    // 5. Target unreachable
    return -1;
}

console.log(solve());<unused56>
