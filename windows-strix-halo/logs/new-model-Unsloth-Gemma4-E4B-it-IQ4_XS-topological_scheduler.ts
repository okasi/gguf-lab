const fs = require('fs');

/**
 * MinPriorityQueue implementation using a Binary Heap.
 * Tasks are stored as strings and ordered lexicographically.
 */
class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    _swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    _compare(a, b) {
        // Lexicographical comparison
        return a < b;
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this._compare(this.heap[index], this.heap[parentIndex])) {
                this._swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    _bubbleDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;

            // Check left child
            if (leftChildIndex <= lastIndex && this._compare(this.heap[leftChildIndex], this.heap[smallest])) {
                smallest = leftChildIndex;
            }

            // Check right child
            if (rightChildIndex <= lastIndex && this._compare(this.heap[rightChildIndex], this.heap[smallest])) {
                smallest = rightChildIndex;
            }

            if (smallest !== index) {
                this._swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }

    insert(item) {
        this.heap.push(item);
        this._bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._bubbleDown(0);
        return min;
    }
}

function solve() {
    // Read all input from stdin
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    
    if (input.length === 0 || input[0] === '') {
        return;
    }

    // Parse N and M
    const [N_str, M_str] = input[0].trim().split(/\s+/);
    const N = parseInt(N_str);
    const M = parseInt(M_str);

    if (N === 0) {
        console.log('');
        return;
    }

    // Parse task names
    const taskNames = input[1].trim().split(/\s+/);
    
    // Adjacency List: task -> list of tasks dependent on task
    const adj = new Map<string, string[]>();
    // In-Degree Map: task -> count of incoming dependencies
    const inDegree = new Map<string, number>();

    // Initialize maps
    for (const task of taskNames) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    // Parse dependencies (M lines)
    for (let i = 0; i < M; i++) {
        const line = input[2 + i].trim();
        if (line === '') continue;
        
        const [A, B] = line.split(/\s+/);

        // A -> B (A must complete before B)
        // Add edge A -> B
        adj.get(A)!.push(B);
        
        // Increment in-degree of B
        inDegree.set(B, inDegree.get(B)! + 1);
    }

    // --- Kahn's Algorithm with Priority Queue ---

    const pq = new MinPriorityQueue();
    const buildOrder: string[] = [];

    // 1. Initialize PQ with tasks having in-degree 0
    for (const task of taskNames) {
        if (inDegree.get(task) === 0) {
            pq.insert(task);
        }
    }

    // 2. Process tasks
    while (!pq.isEmpty()) {
        // Extract the lexicographically smallest available task
        const u = pq.extractMin()!;
        buildOrder.push(u);

        // Process neighbors (tasks dependent on u)
        for (const v of adj.get(u)!) {
            // Decrement in-degree
            const newDegree = inDegree.get(v)! - 1;
            inDegree.set(v, newDegree);

            // If the dependency count reaches 0, add it to the PQ
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }

    // 3. Check for cycle
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(buildOrder.join(' '));
    }
}

solve();
