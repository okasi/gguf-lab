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

    enqueue(element: T): void {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }

    dequeue(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop() as T;
        }

        const root = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return root;
    }

    private bubbleUp(index: number): void {
        let currentIndex = index;
        while (currentIndex > 0) {
            const parentIndex = this.getParentIndex(currentIndex);
            // Comparison: lexicographically smaller
            if (this.heap[currentIndex] < this.heap[parentIndex]) {
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
            let left = this.getLeftChildIndex(currentIndex);
            let right = this.getRightChildIndex(currentIndex);
            let smallest = currentIndex;

            // Compare with left child
            if (left <= lastIndex && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }

            // Compare with right child
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

    if (input.length === 0 || input[0].trim() === "") {
        return;
    }

    // Parse N and M
    const [N, M] = input[0].trim().split(/\s+/).map(Number);

    if (N === 0) {
        console.log("");
        return;
    }

    // Parse task names
    const taskNames = input[1].trim().split(/\s+/);
    const taskMap = new Map<string, number>();
    for (let i = 0; i < N; i++) {
        taskMap.set(taskNames[i], i);
    }

    // Graph representation: Adjacency list and in-degree array
    const adj: number[][] = Array(N).fill(0).map(() => []);
    const inDegree: number[] = Array(N).fill(0);

    // Parse dependencies
    for (let i = 0; i < M; i++) {
        const line = input[2 + i].trim();
        if (!line) continue;
        const [A_name, B_name] = line.split(/\s+/);

        const u = taskMap.get(A_name);
        const v = taskMap.get(B_name);

        if (u === undefined || v === undefined) continue;

        // A -> B (A must be completed before B)
        adj[u].push(v);
        inDegree[v]++;
    }

    // --- Topological Sort using Priority Queue (Kahn's Algorithm variant) ---

    const pq = new PriorityQueue<string>();
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.enqueue(taskNames[i]);
        }
    }

    const buildOrder: string[] = [];

    while (!pq.isEmpty()) {
        // Get the lexicographically smallest available task
        const uName = pq.dequeue()!;
        const uIndex = taskMap.get(uName)!;

        buildOrder.push(uName);

        // Process neighbors
        for (const vIndex of adj[uIndex]) {
            inDegree[vIndex]--;
            if (inDegree[vIndex] === 0) {
                const vName = taskNames[vIndex];
                pq.enqueue(vName);
            }
        }
    }

    // Check for cycle
    if (buildOrder.length === N) {
        console.log(buildOrder.join(" "));
    } else {
        console.log("IMPOSSIBLE");
    }
}

solve();
