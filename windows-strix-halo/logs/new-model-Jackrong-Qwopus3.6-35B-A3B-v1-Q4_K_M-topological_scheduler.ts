import fs = require("fs");

// Binary Min-Heap implementation
class BinaryMinHeap<T> {
    private heap: T[] = [];
    private comparator: (a: T, b: T) => number;

    constructor(comparator: (a: T, b: T) => number) {
        this.comparator = comparator;
    }

    push(item: T): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0 && last !== undefined) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return min;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.comparator(this.heap[index], this.heap[parentIndex]) < 0) {
                this.swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private sinkDown(index: number): void {
        const length = this.heap.length;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallest = index;

            if (leftChildIndex < length && this.comparator(this.heap[leftChildIndex], this.heap[smallest]) < 0) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex < length && this.comparator(this.heap[rightChildIndex], this.heap[smallest]) < 0) {
                smallest = rightChildIndex;
            }

            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split("\n");
    
    if (lines.length < 2) {
        return;
    }

    const firstLine = lines[0].trim().split(/\s+/);
    const n = parseInt(firstLine[0], 10);
    const m = parseInt(firstLine[1], 10);

    const secondLine = lines[1].trim().split(/\s+/);
    const tasks = secondLine.slice(0, n);

    // Map task name to index
    const taskToIndex: Map<string, number> = new Map();
    for (let i = 0; i < n; i++) {
        taskToIndex.set(tasks[i], i);
    }

    // Graph representation
    const adjList: number[][] = new Array(n).fill(null).map(() => []);
    const inDegree: number[] = new Array(n).fill(0);

    for (let i = 0; i < m; i++) {
        const line = lines[i + 2].trim().split(/\s+/);
        const a = line[0];
        const b = line[1];
        
        if (taskToIndex.has(a) && taskToIndex.has(b)) {
            const u = taskToIndex.get(a)!;
            const v = taskToIndex.get(b)!;
            adjList[u].push(v);
            inDegree[v]++;
        }
    }

    // Priority queue for lexicographically smallest task name
    // We need to compare task names, but store indices.
    // Comparator: if taskNames[a] < taskNames[b], then a should come first (smaller in min-heap)
    const pq = new BinaryMinHeap<number>((a, b) => {
        return tasks[a].localeCompare(tasks[b]);
    });

    // Initialize with tasks having in-degree 0
    for (let i = 0; i < n; i++) {
        if (inDegree[i] === 0) {
            pq.push(i);
        }
    }

    const buildOrder: number[] = [];

    while (!pq.isEmpty()) {
        const u = pq.pop()!;
        buildOrder.push(u);

        for (const v of adjList[u]) {
            inDegree[v]--;
            if (inDegree[v] === 0) {
                pq.push(v);
            }
        }
    }

    if (buildOrder.length !== n) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(buildOrder.map(i => tasks[i]).join(" "));
    }
}

solve();
