const fs = require('fs');

/**
 * Custom Min Priority Queue implementation for strings.
 * Prioritizes lexicographically smaller strings.
 */
class MinPriorityQueue {
    private heap: string[] = [];

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    insert(element: string): void {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin(): string | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.sinkDown(0);
        return min;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index] < this.heap[parentIndex]) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private sinkDown(index: number): void {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;

            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex] < this.heap[smallest]) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex] < this.heap[smallest]) {
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

function solve() {
    // Read all input from standard input (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim().split('\n');

    if (input.length === 0) {
        console.log("");
        return;
    }

    // Line 1: N M
    const [N, M] = input[0].split(' ').map(Number);

    if (N === 0) {
        console.log("");
        return;
    }

    // Line 2: Task names
    const tasks = input[1].split(/\s+/).filter(s => s.length > 0);

    // Data structures initialization
    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    // 1. Initialize graph and in-degrees
    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    // Process dependencies (M lines)
    for (let i = 2; i < 2 + M; i++) {
        const line = input[i].trim();
        if (!line) continue;
        const [A, B] = line.split(/\s+/).filter(s => s.length > 0);

        if (adj.has(A) && adj.has(B)) {
            adj.get(A)!.push(B);
            inDegree.set(B, inDegree.get(B)! + 1);
        }
    }

    // 2. Initialize Priority Queue
    const pq = new MinPriorityQueue();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.insert(task);
        }
    }

    const buildOrder: string[] = [];

    // 3. Kahn's Algorithm
    while (!pq.isEmpty()) {
        const u = pq.extractMin();
        buildOrder.push(u);

        const neighbors = adj.get(u) || [];
        
        for (const v of neighbors) {
            const newDegree = inDegree.get(v)! - 1;
            inDegree.set(v, newDegree);

            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }

    // 4. Check for cycle
    if (buildOrder.length === N) {
        console.log(buildOrder.join(' '));
    } else {
        console.log("IMPOSSIBLE");
    }
}

solve();
