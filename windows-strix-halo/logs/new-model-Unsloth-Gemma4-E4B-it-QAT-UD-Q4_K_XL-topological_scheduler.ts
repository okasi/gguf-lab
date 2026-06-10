import * as fs from 'fs';
import { PriorityQueue } from './PriorityQueue';

class PriorityQueue<T> {
    private heap: { value: T, priority: number }[] = [];
    private comparator: (a: T, b: T) => number;

    constructor(comparator: (a: T, b: T) => number) {
        this.comparator = (a, b) => {
            // For lexicographically smallest task name, the priority should be the task name itself,
            // and the comparison should prioritize smaller strings.
            // Here, we treat the task name as the priority.
            return a.toString().localeCompare(b.toString());
        };
    }

    size(): number {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    peek(): T | undefined {
        return this.heap.length > 0 ? this.heap[0].value : undefined;
    }

    enqueue(value: T, priority: number): void {
        const element = { value, priority };
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }

    dequeue(): T | undefined {
        if (this.isEmpty()) return undefined;
        if (this.heap.length === 1) return this.heap.pop()!.value;

        const min = this.heap[0].value;
        this.heap[0] = this.heap.pop()!;
        this.sinkDown(0);
        return min;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
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

            if (leftChildIndex <= lastIndex && this.compare(this.heap[leftChildIndex], this.heap[smallest]) < 0) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && this.compare(this.heap[rightChildIndex], this.heap[smallest]) < 0) {
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

    // Custom comparison logic based on task name lexicographical order
    private compare(a: { value: string, priority: number }, b: { value: string, priority: number }): number {
        return a.value.localeCompare(b.value);
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0] === "") {
        return;
    }

    const [N, M] = input[0].trim().split(/\s+/).map(Number);
    const taskNames = input[1].trim().split(/\s+/);
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const name of taskNames) {
        adj.set(name, []);
        inDegree.set(name, 0);
    }

    for (let i = 2; i < 2 + M; i++) {
        const line = input[i].trim();
        if (!line) continue;
        const [A, B] = line.split(/\s+/);
        if (adj.has(A) && adj.has(B)) {
            adj.get(A)!.push(B);
            inDegree.set(B, (inDegree.get(B) || 0) + 1);
        }
    }

    // Use PriorityQueue to ensure lexicographically smallest task is chosen when multiple are ready
    // The PriorityQueue implementation above is adapted to handle string comparison for ordering.
    const pq = new PriorityQueue<{ value: string, priority: number }>(null); // The comparator inside PQ handles the logic

    for (const name of taskNames) {
        if (inDegree.get(name) === 0) {
            // Priority is irrelevant for the internal heap structure since we override comparison, 
            // but we pass a dummy value.
            pq.enqueue({ value: name, priority: name.charCodeAt(0) }, 0);
        }
    }

    const buildOrder: string[] = [];
    while (!pq.isEmpty()) {
        const currentTask = pq.dequeue()!;
        const taskName = currentTask.value;
        buildOrder.push(taskName);

        const neighbors = adj.get(taskName) || [];
        for (const neighbor of neighbors) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) {
                pq.enqueue({ value: neighbor, priority: neighbor.charCodeAt(0) }, 0);
            }
        }
    }

    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(buildOrder.join(" "));
    }
}

solve();
