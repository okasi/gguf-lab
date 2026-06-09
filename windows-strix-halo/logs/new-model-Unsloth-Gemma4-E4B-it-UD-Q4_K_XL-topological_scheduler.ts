const fs = require('fs');

/**
 * MinHeap implementation for storing task names (strings)
 * prioritized by lexicographical order.
 */
class MinHeap {
    constructor() {
        this.heap = [];
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }

    insert(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        if (this.isEmpty()) return null;
        if (this.heap.length === 1) return this.heap.pop();
        
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }

    getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }

    getLeftChildIndex(i) {
        return 2 * i + 1;
    }

    getRightChildIndex(i) {
        return 2 * i + 2;
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    bubbleUp(index) {
        let currentIndex = index;
        let parentIndex = this.getParentIndex(currentIndex);

        while (currentIndex > 0 && this.heap[currentIndex] < this.heap[parentIndex]) {
            this.swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
            parentIndex = this.getParentIndex(currentIndex);
        }
    }

    bubbleDown(index) {
        let currentIndex = index;
        const lastIndex = this.heap.length - 1;

        while (true) {
            let left = this.getLeftChildIndex(currentIndex);
            let right = this.getRightChildIndex(currentIndex);
            let smallest = currentIndex;

            // Find the smallest among parent, left child, and right child
            if (left <= lastIndex && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right <= lastIndex && this.heap[right] < this.heap[smallest]) {
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
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    
    if (input.length === 0 || input[0] === '') {
        return;
    }

    // Parse N and M
    const [NStr, MStr] = input[0].split(' ').map(s => s.trim()).filter(s => s.length > 0);
    const N = parseInt(NStr);
    const M = parseInt(MStr);

    if (N === 0) {
        console.log("");
        return;
    }

    // Parse task names
    const taskNames = input[1].split(' ').map(s => s.trim()).filter(s => s.length > 0);

    // Data structures
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();
    
    // Initialize all nodes
    for (const task of taskNames) {
        inDegree.set(task, 0);
        adj.set(task, []);
    }

    // Build graph and calculate in-degrees
    for (let i = 0; i < M; i++) {
        const line = input[2 + i];
        if (!line) continue;

        const [A, B] = line.split(' ').map(s => s.trim()).filter(s => s.length > 0);
        
        // A -> B (A must come before B)
        
        // Update adjacency list: A points to B
        adj.get(A)!.push(B);
        
        // Update in-degree of B
        inDegree.set(B, inDegree.get(B)! + 1);
    }

    // --- Topological Sort (Kahn's Algorithm with Priority Queue) ---
    
    const minHeap = new MinHeap();
    const queue = []; // For initial tasks with inDegree 0
    
    // 1. Initialize the priority queue with all tasks having in-degree 0
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            minHeap.insert(task);
        }
    }

    const resultOrder: string[] = [];

    // 2. Process tasks
    while (!minHeap.isEmpty()) {
        // Extract the lexicographically smallest available task
        const u = minHeap.extractMin();
        resultOrder.push(u);

        // Iterate through all neighbors (tasks that depend on u)
        const neighbors = adj.get(u) || [];
        
        for (const v of neighbors) {
            // Decrement in-degree of v
            const currentDegree = inDegree.get(v)! - 1;
            inDegree.set(v, currentDegree);

            // If v is now ready, add it to the min-heap
            if (currentDegree === 0) {
                minHeap.insert(v);
            }
        }
    }

    // 3. Check for cycles
    if (resultOrder.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(resultOrder.join(' '));
    }
}

solve();
