import * as fs from 'fs';

/**
 * MinHeap implementation tailored for lexicographical string comparison.
 * Stores task names (strings).
 */
class MinHeap {
    private heap: string[] = [];

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

    /**
     * Inserts a task name into the heap. O(log N)
     * @param task The task name (string).
     */
    insert(task: string): void {
        this.heap.push(task);
        this.bubbleUp(this.heap.length - 1);
    }

    private bubbleUp(index: number): void {
        let currentIndex = index;
        let parentIndex = this.getParentIndex(currentIndex);

        while (currentIndex > 0 && this.heap[currentIndex] < this.heap[parentIndex]) {
            this.swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
            parentIndex = this.getParentIndex(currentIndex);
        }
    }

    /**
     * Extracts and returns the lexicographically smallest task. O(log N)
     * @returns The smallest task name, or null if empty.
     */
    extractMin(): string | null {
        if (this.isEmpty()) {
            return null;
        }
        if (this.heap.length === 1) {
            return this.heap.pop()!;
        }

        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return min;
    }

    private bubbleDown(index: number): void {
        let currentIndex = index;
        const lastIndex = this.heap.length - 1;

        while (true) {
            let leftIndex = this.getLeftChildIndex(currentIndex);
            let rightIndex = this.getRightChildIndex(currentIndex);
            let smallestIndex = currentIndex;

            // Compare with left child
            if (leftIndex <= lastIndex && this.heap[leftIndex] < this.heap[smallestIndex]) {
                smallestIndex = leftIndex;
            }

            // Compare with right child
            if (rightIndex <= lastIndex && this.heap[rightIndex] < this.heap[smallestIndex]) {
                smallestIndex = rightIndex;
            }

            if (smallestIndex !== currentIndex) {
                this.swap(currentIndex, smallestIndex);
                currentIndex = smallestIndex;
            } else {
                break;
            }
        }
    }
}

/**
 * Main function to solve the Topological Sort problem.
 */
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0 || input[0] === '') {
        console.log("IMPOSSIBLE");
        return;
    }

    // Parse N and M
    const [NStr, MStr] = input[0].trim().split(/\s+/);
    const N = parseInt(NStr);
    const M = parseInt(MStr);

    if (N === 0) {
        console.log("");
        return;
    }

    // Parse task names
    const taskNames = input[1].trim().split(/\s+/);

    // Graph structures
    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    // Initialize all tasks in structures
    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    // Process dependencies
    for (let i = 0; i < M; i++) {
        const line = input[2 + i].trim();
        if (line === '') continue;
        
        const [A, B] = line.split(/\s+/);
        
        // A must be completed before B (A -> B)
        // Ensure both tasks exist before adding edge (robustness check)
        if (adj.has(A) && adj.has(B)) {
            adj.get(A)!.push(B);
            inDegree.set(B, inDegree.get(B)! + 1);
        }
    }

    // Step 1: Initialize Priority Queue (MinHeap)
    const pq = new MinHeap();
    for (const [taskName, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(taskName);
        }
    }

    // Step 2: Perform Kahn's Algorithm using PQ
    const buildOrder: string[] = [];

    while (!pq.isEmpty()) {
        // Extract the lexicographically smallest ready task
        const u = pq.extractMin()!;
        buildOrder.push(u);

        // Process neighbors
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            // Decrement in-degree
            let newDegree = (inDegree.get(v) || 0) - 1;
            inDegree.set(v, newDegree);

            // If in-degree becomes 0, add to PQ
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }

    // Step 3: Check for Cycles
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(buildOrder.join(' '));
    }
}

solve();
