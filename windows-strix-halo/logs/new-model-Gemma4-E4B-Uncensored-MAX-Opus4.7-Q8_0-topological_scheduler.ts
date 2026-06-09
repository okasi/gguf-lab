import * as fs from 'fs';

/**
 * Min-Heap implementation storing task names.
 * Comparison is lexicographical (smaller string is higher priority).
 */
class PriorityQueue<T extends string> {
    private heap: T[] = [];

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    peek(): T | undefined {
        return this.heap[0];
    }

    private getLeftChildIndex(i: number): number {
        return 2 * i + 1;
    }

    private getRightChildIndex(i: number): number {
        return 2 * i + 2;
    }

    private getParentIndex(i: number): number {
        return Math.floor(i / 2);
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private compare<T>(a: T, b: T): boolean {
        // Min-heap comparison: true if a has higher priority (is smaller alphabetically)
        return a < b;
    }

    private siftUp(i: number): void {
        let current = i;
        let parent = this.getParentIndex(current);
        while (current > 0 && this.heap[current] < this.heap[parent]) {
            this.swap(current, parent);
            current = parent;
            parent = this.getParentIndex(current);
        }
    }

    private siftDown(i: number): void {
        let current = i;
        let left = this.getLeftChildIndex(current);
        let right = this.getRightChildIndex(current);
        let smallest = current;

        if (left < this.heap.length && this.heap[left] < this.heap[smallest]] {
            smallest = this.heap[left];
        }
        if (right < this.heap.length && this.heap[right] < this.heap[smallest]] {
            smallest = this.heap[right];
        }

        if (smallest !== current) {
            this.swap(current, smallest);
            this.siftDown(smallest.index);
        }
    }

    enqueue(element: T): void {
        this.heap.push(element);
        this.siftUp(this.heap.length - 1);
    }

    dequeue(): T | undefined {
        const min = this.heap.shift();
        if (this.heap.length === 0) return undefined;
        this.heap[0] = this.heap.pop()!;
        this.siftDown(0);
        return min;
    }
}

/**
 * Performs topological sort using Kahn's algorithm combined with a Min-Heap
 * to ensure deterministic tie-breaking by lexicographical order.
 *
 * @param tasks Map of task names to their dependency count (in-degree).
 * @param adj Adjacency list: key is task name, value is list of tasks depending on it.
 * @returns Array of task names in valid build order, or null if cycle detected.
 */
function getBuildOrder<T extends string>(tasks: Map<T, number>, adj: Map<T, T[]>): T[] | null {
    const inDegree = new Map<T, number>();
    for (const [task, count] of tasks.entries()) {
        inDegree.set(task, count);
    }

    // Initialize Priority Queue with tasks having in-degree 0
    const pq = new PriorityQueue<T>();
    for (const [task, count] of tasks.entries()) {
        if (count === 0) {
            pq.enqueue(task);
        }
    }

    const buildOrder: T[] = [];
    while (!pq.isEmpty()) {
        const task = pq.dequeue()!;
        buildOrder.push(task);

        // Process dependents in sorted order (handled by PQ)
        const dependents = adj.get(task) || [];
        for (const dependent of dependents) {
            let count = inDegree.get(dependent) ?? 0;
            count--;
            inDegree.set(dependent, count);
            if (count === 0) {
                pq.enqueue(dependent);
            }
        }
    }

    return buildOrder.length === tasks.size ? buildOrder : null;
}

function main() {
    try {
        // Read all input from standard input
        const input = fs.readFileSync(0, "utf8").trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);

        if (input.length === 0) {
            console.log("");
            return;
        }

        const [N, M] = input[0].split(/\s+/).map(Number);

        const taskNames = input[1].split(/\s+/).filter(Boolean) as string[];
        const tasks = new Map<string, number>();
        taskNames.forEach(task => tasks.set(task, 0));

        const adj = new Map<string, string[]>();
        taskNames.forEach(task => adj.set(task, []));

        for (let i = 2; i < input.length; i++) {
            const [A, B] = input[i].split(/\s+/).filter(Boolean);
            // A must be completed before B
            const dependents = adj.get(A) || [];
            dependents.push(B);
            adj.set(A, dependents);
        }

        // Calculate initial in-degrees
        for (const [predecessor, successors] of adj.entries()) {
            for (const successor of successors) {
                tasks.set(successor, (tasks.get(successor) ?? 0) + 1);
            }
        }

        const buildOrder = getBuildOrder(tasks, adj);

        if (buildOrder === null) {
            console.log("IMPOSSIBLE");
        } else {
            console.log(buildOrder.join(' '));
        }

    } catch (e) {
        console.error("Error processing input:", e);
        process.exit(1);
    }
}

main();
