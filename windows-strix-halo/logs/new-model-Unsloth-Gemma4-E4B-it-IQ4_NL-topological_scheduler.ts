import * as fs from 'fs';

/**
 * Custom MinHeap implementation using lexicographical comparison for strings.
 * This is required to ensure that when multiple tasks are ready (in-degree 0),
 * the lexicographically smallest one is chosen next.
 */
class MinHeap {
    private heap: string[] = [];

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private parent(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    private left(i: number): number {
        return 2 * i + 1;
    }

    private right(i: number): number {
        return 2 * i + 2;
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private bubbleUp(index: number): void {
        let current = index;
        while (current > 0) {
            let parentIndex = this.parent(current);
            // Compare lexicographically
            if (this.heap[current] < this.heap[parentIndex]) {
                this.swap(current, parentIndex);
                current = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        let current = index;
        const lastIndex = this.heap.length - 1;

        while (true) {
            let leftChild = this.left(current);
            let rightChild = this.right(current);
            let smallest = current;

            // Find the smallest among parent, left, and right
            if (leftChild <= lastIndex && this.heap[leftChild] < this.heap[smallest]) {
                smallest = leftChild;
            }
            if (rightChild <= lastIndex && this.heap[rightChild] < this.heap[smallest]) {
                smallest = rightChild;
            }

            if (smallest !== current) {
                this.swap(current, smallest);
                current = smallest;
            } else {
                break;
            }
        }
    }

    insert(value: string): void {
        this.heap.push(value);
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
        // Move last element to the root
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return min;
    }
}

/**
 * Main function to solve the topological sorting problem.
 */
function solve() {
    // Read input from standard input (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    
    if (input.length === 0 || input[0].length === 0) {
        console.log("");
        return;
    }

    // 1. Parse N and M
    const [N, M] = input[0].split(' ').map(Number);

    // Handle case where N=0
    if (N === 0) {
        console.log("");
        return;
    }

    // 2. Parse Task Names
    const tasks = input[1].split(' ');
    const taskToId = new Map<string, number>();
    tasks.forEach((task, index) => taskToId.set(task, index));

    // Data Structures Initialization
    // adj: Adjacency List (Task Name -> List of Tasks it points to)
    const adj: Map<string, string[]> = new Map();
    // inDegree: Stores the number of prerequisites for each task
    const inDegree: Map<string, number> = new Map();

    tasks.forEach(task => {
        adj.set(task, []);
        inDegree.set(task, 0);
    });

    // 3. Build Graph (Edges)
    for (let i = 0; i < M; i++) {
        const line = input[2 + i].split(' ');
        if (line.length !== 2) continue;

        const preReq = line[0];
        const dependent = line[1];

        // Add edge: preReq -> dependent
        adj.get(preReq)!.push(dependent);
        inDegree.set(dependent, inDegree.get(dependent)! + 1);
    }

    // 4. Initialize Priority Queue (Min-Heap)
    const pq = new MinHeap();
    
    // Add all tasks with zero in-degree to the PQ
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.insert(task);
        }
    }

    // 5. Topological Sort
    const buildOrder: string[] = [];

    while (!pq.isEmpty()) {
        // Always extract the lexicographically smallest task
        const u = pq.extractMin()!;
        buildOrder.push(u);

        // Process neighbors
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            // Reduce in-degree of neighbors
            const currentDegree = inDegree.get(v)!;
            const newDegree = currentDegree - 1;
            inDegree.set(v, newDegree);

            // If a neighbor becomes ready, add it to the PQ
            if (newDegree === 0) {
                pq.insert(v);
            }
        }
    }

    // 6. Check for Cycles and Output
    if (buildOrder.length === N) {
        console.log(buildOrder.join(' '));
    } else {
        console.log("IMPOSSIBLE");
    }
}

solve();
