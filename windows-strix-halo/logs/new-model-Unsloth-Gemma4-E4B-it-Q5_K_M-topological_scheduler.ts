import * as fs from 'fs';

/**
 * Implements a Min-Heap specifically for string comparison (lexicographical order).
 */
class PriorityQueue {
    private heap: string[] = [];

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private getParentIndex(i: number): number { return Math.floor((i - 1) / 2); }
    private getLeftChildIndex(i: number): number { return 2 * i + 1; }
    private getRightChildIndex(i: number): number { return 2 * i + 2; }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    /**
     * Inserts an element while maintaining the heap property. O(log N)
     */
    insert(element: string): void {
        this.heap.push(element);
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
     * Extracts the minimum element (lexicographically smallest). O(log N)
     */
    extractMin(): string | undefined {
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

    private bubbleDown(index: number): void {
        let currentIndex = index;
        const size = this.heap.length;

        while (true) {
            const left = this.getLeftChildIndex(currentIndex);
            const right = this.getRightChildIndex(currentIndex);
            let smallest = currentIndex;

            // Compare with left child
            if (left < size && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }

            // Compare with right child
            if (right < size && this.heap[right] < this.heap[smallest]) {
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

function solve() {
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0].trim() === '') {
        console.log("");
        return;
    }

    let lineIndex = 0;
    const [N_str, M_str] = input[lineIndex++].trim().split(' ');
    const N = parseInt(N_str);
    const M = parseInt(M_str);

    if (N === 0) {
        console.log("");
        return;
    }

    // Read task names
    const tasks = input[lineIndex++].trim().split(/\s+/);

    // Data structures for topological sort (Kahn's algorithm with Min-Heap)
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();
    
    // Initialize structures for all tasks
    for (const task of tasks) {
        inDegree.set(task, 0);
        adj.set(task, []);
    }

    // Read dependencies
    for (let i = 0; i < M; i++) {
        const line = input[lineIndex++].trim();
        if (line === '') continue;
        
        const [A, B] = line.split(/\s+/); // A -> B (A must come before B)
        
        // Build graph
        if (adj.has(A) && inDegree.has(B)) {
            adj.get(A)!.push(B);
            inDegree.set(B, inDegree.get(B)! + 1);
        }
    }

    // 1. Initialize Min-Heap with tasks having in-degree 0
    const pq = new PriorityQueue();
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }

    // 2. Perform topological sort
    const result: string[] = [];
    
    while (!pq.isEmpty()) {
        // Get the lexicographically smallest ready task
        const u = pq.extractMin()!;
        result.push(u);

        // Process neighbors
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            // Decrement in-degree
            const newDegree = (inDegree.get(v)! - 1);
            inDegree.set(v, newDegree);

            // If ready, add to priority queue
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }

    // 3. Check for cycle
    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(' '));
    }
}

solve();
