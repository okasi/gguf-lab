import * as fs from "fs";

/**
 * A simple Min-Priority Queue implemented using an array representation of a Binary Heap.
 * Stores strings and prioritizes lexicographically smaller strings.
 */
class PriorityQueue<T extends string> {
    private heap: T[] = [];

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private getParentIndex(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private getLeftChildIndex(i: number): number {
        return 2 * i + 1;
    }

    private getRightChildIndex(i: number): number {
        return 2 * i + 2;
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Comparison function: lexicographically smaller has higher priority
    private compare(a: T, b: T): boolean {
        return a < b;
    }

    enqueue(element: T): void {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }

    dequeue(): T | undefined {
        if (this.isEmpty()) return undefined;
        if (this.heap.length === 1) return this.heap.pop() as T;

        const min = this.heap[0];
        this.heap[0] = this.heap.pop() as T;
        this.bubbleDown(0);
        return min;
    }

    private bubbleUp(index: number): void {
        let currentIndex = index;
        while (currentIndex > 0) {
            const parentIndex = this.getParentIndex(currentIndex);
            if (this.compare(this.heap[currentIndex], this.heap[parentIndex])) {
                this.swap(currentIndex, parentIndex);
                currentIndex = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        let currentIndex = index;
        const lastIndex = this.heap.length - 1;

        while (true) {
            const left = this.getLeftChildIndex(currentIndex);
            const right = this.getRightChildIndex(currentIndex);
            let smallest = currentIndex;

            // Check left child
            if (left <= lastIndex && this.compare(this.heap[left], this.heap[smallest])) {
                smallest = left;
            }

            // Check right child
            if (right <= lastIndex && this.compare(this.heap[right], this.heap[smallest])) {
                smallest = right;
            }

            if (smallest !== currentIndex) {
                this.swap(currentIndex, smallest);
                currentIndex = smallest;
            } else {
                break;
            }
        }
    }
}

function solve(): void {
    // Read all input from stdin
    const input = fs.readFileSync(0, "utf8").trim().split("\n");

    if (input.length < 2) {
        return;
    }

    // Parse N and M
    const [n, m] = input[0].trim().split(/\s+/).map(Number);

    // Parse task names
    const taskNames = input[1].trim().split(/\s+/);

    if (taskNames.length !== n) {
        // Handle case where N might be inconsistent with actual input
        // For robustness, we proceed with min(N, taskNames.length) but assume consistency per problem statement
    }

    // 1. Initialize Graph and In-degrees
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    for (const task of taskNames) {
        adj[task] = [];
        inDegree[task] = 0;
    }

    // 2. Build Graph and calculate In-degrees
    for (let i = 2; i < 2 + m; i++) {
        const line = input[i].trim();
        if (!line) continue;
        const parts = line.split(/\s+/);
        if (parts.length < 2) continue;

        const [u, v] = parts; // u must be completed before v (u -> v)

        if (adj[u] && adj[v]) {
            adj[u].push(v);
            inDegree[v]++;
        }
    }

    // 3. Initialize Priority Queue with tasks having in-degree 0
    const pq = new PriorityQueue<string>();

    for (const task of taskNames) {
        if (inDegree[task] === 0) {
            pq.enqueue(task);
        }
    }

    // 4. Topological Sort using PQ (Kahn's algorithm variant)
    const buildOrder: string[] = [];

    while (!pq.isEmpty()) {
        // Dequeue the lexicographically smallest available task
        const currentTask = pq.dequeue()!;
        buildOrder.push(currentTask);

        // Process neighbors
        for (const neighbor of adj[currentTask]) {
            inDegree[neighbor]--;
            
            // If in-degree drops to 0, add it to the PQ
            if (inDegree[neighbor] === 0) {
                pq.enqueue(neighbor);
            }
        }
    }

    // 5. Output Result
    if (buildOrder.length === n) {
        console.log(buildOrder.join(" "));
    } else {
        console.log("IMPOSSIBLE");
    }
}

solve();
