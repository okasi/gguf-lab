const fs = require('fs');

class MinHeap {
    private heap: string[];

    constructor() {
        this.heap = [];
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    size(): number {
        return this.heap.length;
    }

    push(val: string): void {
        this.heap.push(val);
        this._siftUp(this.heap.length - 1);
    }

    pop(): string {
        if (this.isEmpty()) {
            throw new Error("Heap is empty");
        }
        const last = this.heap.pop();
        if (this.heap.length === 0) {
            return last;
        }
        const root = this.heap[0];
        this.heap[0] = last;
        this._siftDown(0);
        return root;
    }

    private _siftUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex] <= this.heap[index]) {
                break;
            }
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    private _siftDown(index: number): void {
        const length = this.heap.length;
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallest = index;

            if (leftIndex < length && this.heap[leftIndex] < this.heap[smallest]) {
                smallest = leftIndex;
            }
            if (rightIndex < length && this.heap[rightIndex] < this.heap[smallest]) {
                smallest = rightIndex;
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

function main(): void {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) {
        return;
    }

    const [nStr, mStr] = lines[0].trim().split(' ').map(Number);
    const tasks = lines[1].trim().split(' ').map(s => s.trim());
    const edgesRaw = lines.slice(2).map(line => line.trim().split(' '));

    // Validation for N
    if (tasks.length !== nStr) {
        // In case input mismatch, trust tasks array length or N. 
        // Using tasks array for graph construction.
    }

    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // Initialize tasks
    for (const task of tasks) {
        if (!graph.has(task)) {
            graph.set(task, new Set());
        }
        inDegree.set(task, 0);
    }

    // Process edges
    for (const [a, b] of edgesRaw) {
        if (!graph.has(a)) {
            graph.set(a, new Set());
        }
        if (!graph.has(b)) {
            graph.set(b, new Set());
        }
        if (!graph.get(a).has(b)) {
            graph.get(a).add(b);
            inDegree.set(b, (inDegree.get(b) || 0) + 1);
        }
    }

    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const task = heap.pop();
        result.push(task);

        const neighbors = graph.get(task);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const newDegree = (inDegree.get(neighbor) || 0) - 1;
                inDegree.set(neighbor, newDegree);
                if (newDegree === 0) {
                    heap.push(neighbor);
                }
            }
        }
    }

    if (result.length < tasks.length) {
        console.log('IMPOSSIBLE');
    } else {
        console.log(result.join(' '));
    }
}

if (require.main === module) {
    main();
}
