import * as fs from 'fs';

/**
 * MinPriorityQueue implementation using a Min-Heap structure.
 * Stores [cost, x, y] tuples, comparing by cost (index 0).
 */
class MinPriorityQueue<T extends [number, number, number]> {
    private heap: T[] = [];

    private getParentIndex(i: number): number { return Math.floor((i - 1) / 2); }
    private getLeftChildIndex(i: number): number { return 2 * i + 1; }
    private getRightChildIndex(i: number): number { return 2 * i + 2; }
    private getParent(i: number): number { return Math.floor((i - 1) / 2); }
    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private getCost(i: number): number {
        return this.heap[i][0] as number;
    }

    private up(): void {
        let currentIndex = this.heap.length - 1;
        let parentIndex = this.getParentIndex(currentIndex);

        while (currentIndex > 0 && this.heap[currentIndex][0]! < this.heap[this.getParentIndex(currentIndex)][0]!) {
            this.up();
            let parentIndex = this.getParentIndex(currentIndex);
            this.swap(currentIndex, parentIndex);
            currentIndex = this.heap.length - 1;
            this.heap.pop();
            this.heap.splice(currentIndex, 0, this.heap[0]);
            this.heap.shift();
        }
    }

    private down(): void {
        let currentIndex = this.heap.length - 1;

        while (currentIndex >= 0) {
            let leftChildIndex = this.getLeftChildIndex(currentIndex);
            let rightChildIndex = this.getRightChildIndex(currentIndex);

            let smallestIndex = currentIndex;
            let smallestCost = this.getCost(currentIndex);

            if (this.heap[leftChildIndex]?.[0]! < smallestCost) {
                smallestIndex = this.heap.length - 1;
                this.heap.pop() as [number, number, number];
                this.heap[currentIndex] = this.heap[smallestIndex]!;
                this.heap.splice(smallestIndex, 0, this.heap.pop()! as [number, number, number]);
                this.heap.length--;
            } else if (this.heap[rightChildIndex]?.[0]! < this.heap[smallestIndex]?.[0]!) {
                let parentIndex = this.heap.length - 1;
                this.heap.pop() as [number, number, number];
                this.heap[smallestIndex] = this.heap[parentIndex]!;
                this.heap.splice(smallestIndex, 0, this.heap.pop()! as [number, number, number]);
                this.heap.length--;
            } else {
                break;
            }
            this.heap.splice(currentIndex, 0, this.heap.splice(smallestIndex, 1)[0]! as [number, number, number]);
            this.heap.length--;
            this.up();
        }
    }

    /**
     * Inserts an element.
     * @param item [cost, x, y]
     */
    public insert<T>(item: T): void {
        this.heap.push(item as [number, number, number]);
        this.up();
    }

    /**
      * Returns the element with the minimum cost.
      */
    public peek(): [number, number, number] | undefined {
        return this.heap[0];
    }

    /**
     * Removes and returns the element with the minimum cost.
     */
    public extractMin(): [number, number, number] | undefined {
        const min = this.heap.shift() as [number, number, number] | undefined;
        if (!min) return undefined;

        if (this.heap.length > 0) {
            this.heap[0] = this.heap.splice(this.heap.length - 1, 1)[0]! as [number, number, number];
            this.down();
        }
        return min;
    }

    public size(): number {
        return this.heap.length;
    }
}

/**
 * Represents the cost of moving into a cell.
 */
function getCost(char: string): number {
    if (char === 'S') return 0;
    if (char === 'T') return 0;
    if (char === '#') return Infinity;
    const code = char.charCodeAt(0);
    return code - '0'.charCodeAt(0);
}

/**
 * Runs Dijkstra's algorithm to find the minimum cost path from S to T.
 * @param grid 2D array of map characters.
 * @param H Height of the grid.
 * @param W Width of the grid.
 * @returns Minimum cost, or -1 if unreachable.
 */
function solve(grid: string[][], H: number, W: number): number {
    let startX = -1;
    let startY = -1;
    let targetX = -1;
    let targetY = -1;

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            const char = grid[r][c];
            if (char === 'S') {
                startX = c;
                startY = r;
            } else if (char === 'T') {
                targetX = c;
                targetY = r;
            }
        }
    }

    if (startX === -1 || targetX === -1) {
        return -1; // Start or target not found
    }

    // Distance array: initialized to Infinity, representing unvisited
    // Using Map<string, number> for sparse/dynamic indexing
    const dist = new Map<string, number>();
    const getKey = (x: number, y: number): string => `${x},${y}`;

    // Start state: [cost, x, y]
    // Cost of entering S is 0, so initial cost is 0.
    const pq = new MinPriorityQueue<[number, number, number]>();
    pq.insert([0, startX, startY]);
    dist.set(getKey(startX, startY), 0);

    // Directions: (dx, dy) for up, down, left, right
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (pq.peek() && pq.peek()[0]! < (dist.get(getKey(Infinity, Infinity)) ?? Infinity)) {
        const [cost, x, y] = pq.extractMin()! as [number, number, number];
        const currentKey = getKey(x, y);

        if (Cost.get(currentKey) === undefined || cost >= Cost.get(currentKey)! + 1) {
            // Stale entry (a shorter path was found earlier)
            continue;
        }

        if (x === targetX && y === targetY) {
            return cost;
        }

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            // Boundary checks
            if (nx < 0 || nx >= W || ny < 0 || ny >= H) {
                continue;
            }

            // Wall check
            const char = grid[ny][nx];
            if (char === '#') {
                continue;
            }

            const moveCost = getCost(char);
            const newCost = cost + moveCost;

            const nextKey = getKey(nx, ny);
            const knownCost = dist.get(nextKey) ?? Infinity;

            if (newCost < knownCost) {
                dist.set(nextKey, newCost);
                pq.insert([newCost, nx, ny]);
            }
        }
    }

    return -1; // Target unreachable
}

/**
 * Helper class to manage costs associated with coordinates
 * to avoid repeated Map lookups and improve readability.
 */
const Cost = {
    get: (key: string): number | undefined => {
        const value = Cost.get(key);
        return typeof value === 'number' ? value : undefined;
    },
    set: (key: string, value: number): void => {
        Cost.set(key, value);
    }
};

/**
 * Main function to handle file I/O and execution.
 */
function main() {
    try {
        const input = fs.readFileSync(0, "utf8").trim().split('\n');
        if (!input || input.length === 0) {
            console.log(-1);
            return;
        }

        const [H, W] = input[0].split(' ');
        const H_val = parseInt(H);
        const W_val = parseInt(W);

        const grid: string[][] = [];
        for (let r = 0; r < H_val; r++) {
            grid.push(input[r].split(''));
        }

        const result = solve(grid, H_val, W_val);
        console.log(result);

    } catch (e) {
        // Handle file reading errors or parsing errors
        console.error("Error processing input:", e);
    }
}

main();
