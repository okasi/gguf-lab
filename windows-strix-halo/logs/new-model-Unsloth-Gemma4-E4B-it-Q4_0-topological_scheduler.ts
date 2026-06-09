import * as fs from 'fs';

/**
 * Implements a Min-Heap for string comparison (lexicographical order).
 * The smallest task name is always at the root.
 */
class PriorityQueue {
    private heap: string[] = [];

    public size(): number {
        return this.heap.length;
    }

    public isEmpty(): boolean {
        return this.heap.length === 0;
    }

    public insert(value: string): void {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }

    public extractMin(): string | undefined {
        if (this.isEmpty()) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        const last = this.heap.pop()!;
        this.heap[0] = last;
        this.bubbleDown(0);
        return min;
    }

    private bubbleUp(index: number): void {
        let current = index;
        while (current > 0) {
            let parent = Math.floor((current - 1) / 2);
            // Compare lexicographically: parent > current means swap
            if (this.heap[current] < this.heap[parent]) {
                [this.heap[current], this.heap[parent]] = [this.heap[parent], this.heap[current]];
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

            // Find the smallest among current, leftChild, and rightChild
            if (leftChild <= lastIndex && this.heap[leftChild] < this.heap[smallest]) {
                smallest = leftChild;
            }
            if (rightChild <= lastIndex && this.heap[rightChild] < this.heap[smallest]) {
                smallest = rightChild;
            }

            if (smallest !== current) {
                [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
                current = smallest;
            } else {
                break;
            }
        }
    }
}

function solve() {
    // Read all input from standard input descriptor 0
    const input = fs.readFileSync(0, "utf8").trim().split('\n');

    if (input.length === 0 || input[0].trim() === '') {
        return;
    }

    // 1. Parse N and M
    const [NStr, MStr] = input[0].trim().split(' ');
    const N = parseInt(NStr);
    const M = parseInt(MStr);

    if (N === 0) return;

    // 2. Parse task names
    const taskNames = input[1].trim().split(/\s+/);

    // 3. Initialize graph structures
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const task of taskNames) {
        inDegree.set(task, 0);
        adj.set(task, []);
    }

    // 4. Build graph and calculate in-degrees
    for (let i = 0; i < M; i++) {
        const line = input[2 + i].trim().split(/\s+/);
        if (line.length !== 2) continue;

        const prerequisite = line[0];
        const dependent = line[1];

        // Edge: prerequisite -> dependent
        
        // Ensure tasks exist in the map before modifying
        if (!inDegree.has(prerequisite) || !inDegree.has(dependent)) {
            // Handle cases where input tasks might be malformed/missing
            continue;
        }

        // Update structures
        adj.get(prerequisite)!.push(dependent);
        inDegree.set(dependent, inDegree.get(dependent)! + 1);
    }

    // 5. Initialize Priority Queue (Min-Heap)
    const pq = new PriorityQueue();
    
    // Seed the queue with all tasks having an initial in-degree of 0
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }

    // 6. Topological Sort (Kahn's Algorithm with Priority Queue)
    const result: string[] = [];

    while (!pq.isEmpty()) {
        // Extract the lexicographically smallest task available
        const currentTask = pq.extractMin()!;
        result.push(currentTask);

        // Process neighbors (tasks dependent on currentTask)
        const neighbors = adj.get(currentTask) || [];
        
        for (const neighbor of neighbors) {
            // Decrement the in-degree of the neighbor
            let newDegree = (inDegree.get(neighbor) || 0) - 1;
            inDegree.set(neighbor, newDegree);

            // If the neighbor is now ready, add it to the priority queue
            if (newDegree === 0) {
                pq.insert(neighbor);
            }
        }
    }

    // 7. Output Result
    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(' '));
    }
}

solve();
