import * as fs from 'fs';

/**
 * Priority Queue implementation (Min-Heap)
 * Stores [cost, row, col] tuples, ordered by cost.
 */
class MinPriorityQueue {
    private heap: [number, number, number][] = [];

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    /**
     * Inserts an item into the heap.
     * @param item [cost, row, col]
     */
    insert(item: [number, number, number]): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * Extracts the item with the minimum cost.
     * @returns [cost, row, col]
     */
    extractMin(): [number, number, number] | undefined {
        if (this.isEmpty()) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return min;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            // Compare by cost (index 0)
            if (this.heap[index][0] < this.heap[parentIndex][0]) {
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
            let smallestIndex = index;

            // Check left child
            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex][0] < this.heap[smallestIndex][0]) {
                smallestIndex = leftChildIndex;
            }

            // Check right child
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

/**
 * Reads input, performs Dijkstra's algorithm, and prints the result.
 */
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    
    if (input.length === 0) {
        console.log(-1);
        return;
    }

    // 1. Parse H and W
    const [hStr, wStr] = input[0].split(' ');
    const H = parseInt(hStr);
    const W = parseInt(wStr);

    const grid: string[][] = [];
    let startR = -1, startC = -1;
    let targetR = -1, targetC = -1;

    // 2. Parse Grid and find S and T
    for (let i = 0; i < H; i++) {
        const rowChars = input[i + 1].split('');
        grid.push(rowChars);
        for (let j = 0; j < W; j++) {
            const char = rowChars[j];
            if (char === 'S') {
                startR = i;
                startC = j;
            } else if (char === 'T') {
                targetR = i;
                targetC = j;
            }
        }
    }

    // 3. Initialization
    // dist[r][c] stores the minimum cost to reach (r, c)
    const dist: number[][] = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    const pq = new MinPriorityQueue();

    // Start setup
    dist[startR][startC] = 0;
    // Push [cost, r, c]
    pq.insert([0, startR, startC]);

    // Directions: Up, Down, Left, Right
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    // 4. Dijkstra's Algorithm
    while (!pq.isEmpty()) {
        const [currentCost, r, c] = pq.extractMin()!;

        // Skip if we found a better path already
        if (currentCost > dist[r][c]) {
            continue;
        }

        // Check if target reached
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

            const cell = grid[nr][nc];

            // Check for wall
            if (cell === '#') {
                continue;
            }

            // Calculate cost to enter (nr, nc)
            let moveCost = 0;
            if (cell >= '0' && cell <= '9') {
                moveCost = parseInt(cell);
            } else if (cell === 'S' || cell === 'T') {
                // Entering S or T costs 0
                moveCost = 0;
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
