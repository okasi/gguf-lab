import * as fs from 'fs';

/**
 * Implements a Min-Heap Priority Queue for string elements,
 * prioritizing the lexicographically smallest string.
 */
class MinPriorityQueue {
    private heap: string[] = [];

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    // Returns the smallest element (lexicographically)
    peek(): string | undefined {
        return this.heap.length > 0 ? this.heap[0] : undefined;
    }

    /**
     * Inserts an element and maintains the heap property.
     * @param element The string to insert.
     */
    enqueue(element: string): void {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * Removes and returns the smallest element (root).
     * @returns The smallest element.
     */
    dequeue(): string | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const root = this.heap[0];
        // Move the last element to the root and heapify down
        this.heap[0] = this.heap.pop()!;
        this.sinkDown(0);
        return root;
    }

    private bubbleUp(index: number): void {
        let current = index;
        while (current > 0) {
            const parent = Math.floor((current - 1) / 2);
            // Lexicographical comparison: a < b means a comes first (min-heap)
            if (this.heap[current] < this.heap[parent]) {
                [this.heap[current], this.heap[parent]] = [this.heap[parent], this.heap[current]];
                current = parent;
            } else {
                break;
            }
        }
    }

    private sinkDown(index: number): void {
        let current = index;
        const n = this.heap.length;

        while (true) {
            let left = 2 * current + 1;
            let right = 2 * current + 2;
            let smallest = current;

            // Check left child
            if (left < n && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }

            // Check right child
            if (right < n && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }

            if (smallest !== current) {
                // Swap and continue sinking
                [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
                current = smallest;
            } else {
                break;
            }
        }
    }
}

function solve() {
    try {
        const input = fs.readFileSync(0, "utf8").trim().split('\n');
        if (input.length === 0) {
            console.log("");
            return;
        }

        // Parse N and M
        const [N_str, M_str] = input[0].split(' ').map(s => s.trim()).filter(s => s.length > 0);
        const N = parseInt(N_str);
        const M = parseInt(M_str);

        // Parse task names
        const taskNames = input[1].split(/\s+/).filter(s => s.length > 0);

        // Data structures initialization
        const adj: Map<string, string[]> = new Map(); // Adjacency list (A -> [B, C] if A must precede B and C)
        const inDegree: Map<string, number> = new Map(); // Count of prerequisites for each task

        // Initialize all tasks
        for (const task of taskNames) {
            adj.set(task, []);
            inDegree.set(task, 0);
        }

        // Process dependencies (M lines)
        for (let i = 0; i < M; i++) {
            const line = input[2 + i];
            if (!line) continue;
            
            const parts = line.split(/\s+/).map(s => s.trim()).filter(s => s.length > 0);
            if (parts.length !== 2) continue;

            const prereq = parts[0]; // A
            const dependent = parts[1]; // B

            // A -> B means A must precede B
            adj.get(prereq)!.push(dependent);
            inDegree.set(dependent, (inDegree.get(dependent) || 0) + 1);
        }

        // --- Topological Sort using Min-Heap ---
        const pq = new MinPriorityQueue();
        const result: string[] = [];

        // 1. Initialize the priority queue with all tasks having an in-degree of 0
        for (const [task, degree] of inDegree.entries()) {
            if (degree === 0) {
                pq.enqueue(task);
            }
        }

        // 2. Process tasks
        while (!pq.isEmpty()) {
            // Get the lexicographically smallest available task
            const u = pq.dequeue()!;
            result.push(u);

            // Iterate over all tasks v that depend on u
            const neighbors = adj.get(u) || [];
            for (const v of neighbors) {
                // Decrement the required prerequisites for v
                const newDegree = (inDegree.get(v) || 0) - 1;
                inDegree.set(v, newDegree);

                // If v now has all prerequisites met, add it to the PQ
                if (newDegree === 0) {
                    pq.enqueue(v);
                }
            }
        }

        // 3. Check for cycle
        if (result.length === N) {
            console.log(result.join(' '));
        } else {
            console.log("IMPOSSIBLE");
        }

    } catch (e) {
        // Handle potential read errors gracefully if needed, though usually unnecessary for competitive programming style I/O
        // console.error("Error processing input:", e);
    }
}

solve();
