"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * MinHeap implementation tailored for lexicographical comparison of task names.
 * Since we must always pick the smallest available task, a MinHeap is essential
 * for maintaining O(log K)) extraction time, where K is the number of
 * tasks with no prerequisites.
 */
class MinHeap {
    constructor() {
        this.heap = [];
        this.availableTasks = new Set();
    }
    getParent(i) { return Math.floor((i - 1) / 2); }
    getLeft(i) { return 2 * i + 1; }
    getRight(i) { return 2 * i + 2; }
    getParentIndex(i) { return Math.floor((i - 1) / 2); }
    compare(a, b) {
        if (a instanceof MinHeap) {
            return a._compare(b);
        }
        return a._compare(b);
    }
    _compare(a, b) {
        // MinHeap: true if a should be placed higher (smaller) than b
        return a.localeCompare(b) < 0;
    }
    size() { return this.heap.length; }
    isEmpty() { return this.heap.length === 0; }
    peek() { return this.heap[0]; }
    pop() {
        if (this.heap.length === 0)
            return undefined;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (last) {
            this.heap[0] = last;
            this.heapifyDown(0);
        }
        return min;
    }
    insert(item) {
        this.heap.push(item);
        this.heapifyUp(this.heap.length - 1);
    }
    has(item) {
        // Since MinHeap doesn't provide O(1) lookup, we use a separate Set
        // to manage availability for O(1) checking.
        return this.availableTasks.has(item);
    }
    remove(item) {
        const index = this.availableTasks.delete(item);
        if (index === undefined)
            return false;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (last) {
            this.heap[0] = last;
            this.heapifyDown(0);
        }
        return true;
    }
    heapifyUp(index) {
        let currentIndex = index;
        while (currentIndex > 0 && this.heap.length > 1 && this.heap[this.heap.getParentIndex(currentIndex)]
            === this.heap[currentIndex]) {
            let parentIndex = this.heap.getParentIndex(currentIndex);
            if (this.heap[currentIndex].localeCompare(this.heap[this.heap.getParentIndex(currentIndex)]))
                ;
            ;
            {
                [this.heap[currentIndex], this.heap[this.heap.getParentIndex(currentIndex)]] = [this.heap[this.heap.getParentIndex(currentIndex)], this.heap[currentIndex]];
                currentIndex = this.heap.getParentIndex(currentIndex);
            }
            {
                break;
            }
        }
    }
    heapifyDown(index) {
        let currentIndex = index;
        while (currentIndex + 1 < this.heap.length && (this.heap[this.heap.getLeft(currentIndex)]))
            ;
        localeCompare(this.heap[this.heap.getRight(currentIndex)]);
        ;
        {
            let leftChildIndex = this.heap.getLeft(currentIndex);
            let rightChildIndex = this.heap.getRight(currentIndex);
            let smallestChildIndex = leftChildIndex;
            if (rightChildIndex < this.heap.length && this.heap[this.heap.getRight(currentIndex)]
                .localeCompare(this.heap[this.heap.getLeft(currentIndex)]))
                ;
            ;
            {
                smallestChildIndex = rightChildIndex;
            }
            [this.heap[currentIndex], this.heap[this.heap.getLeft(currentIndex)]] = [this.heap[this.heap.getLeft(currentIndex)], this.heap[this.heap.getRight(currentIndex)]];
            currentIndex = this.heap.getSmallestChildIndex(currentIndex);
        }
    }
    getLeft(i) { return 2 * i + 1; }
    getRight(i) { return 2 * i + 2; }
    getParentIndex(i) { return Math.floor((i - 1) / 2); }
    getSmallestChildIndex(currentIndex) {
        let leftIndex = this.heap.getLeft(currentIndex);
        let rightIndex = this.heap.getRight(currentIndex);
        if (leftIndex >= this.heap.length) {
            return rightIndex;
        }
        let smallestChildIndex = leftIndex;
        if (rightIndex < this.heap.length && this.heap[this.heap.getRight(currentIndex)]
            .localeCompare(this.heap[this.heap.getLeft(currentIndex)]))
            ;
        ;
        {
            smallestChildIndex = this.heap.getRight(currentIndex);
        }
        return smallestChildIndex;
    }
    /**
     * Adds a task to the heap and marks it as available.
     * Time complexity: O(log K))
     */
    insert(task) {
        this.heap.push(task);
        this.heapifyUp(this.heap.length - 1);
        this.availableTasks.add(task);
    }
    /**
     * Removes the lexicographically smallest available task from the heap.
     * Time complexity: O(log K)))
     */
    pop() {
        const min = this.heap[0];
        const last = this.heap.pop();
        if (last) {
            this.heap[0] = last;
            this.heapifyDown(0);
        }
        this.availableTasks.delete(min);
        return min;
    }
    /**
     * Checks if a task is available (in-degree 0) and currently in the heap.
     * Time complexity: O(1)))
     */
    has(task) {
        return this.availableTasks.has(task);
    }
}
/**
 * Priority Queue (MinHeap) for selecting the lexicographically smallest available task.
 * Stores tasks sorted by task name.
 * Complexity: O((N + M) log K))) where K is the current size.
 */
class PriorityQueue {
    constructor() {
        this.heap = new MinHeap();
    }
    /**
     * Inserts a task into the Priority Queue.
     * Time complexity: O(log K)))
     */
    enqueue(task) {
        this.heap.insert(task);
    }
    /**
     * Retrieves and removes the lexicographically smallest available task.
     * Time complexity: O(log K)))
     */
    dequeue() {
        return this.heap.pop();
    }
    /**
     * Checks if any task is available (in-degree 0) and in the heap.
     * Time complexity: O(1)))
     */
    peek() {
        return this.heap.peek();
    }
    /**
     * Returns the number of currently available tasks.
     * Time complexity: O(1)))
     */
    size() {
        return this.heap.size();
    }
}
/**
 * Main logic function.
 * Uses Kahn's algorithm for Topological Sort, leveraging the MinHeap to
 * enforce the lexicographically smallest choice among ready tasks.
 * Overall complexity: O((N + M) log K)))
 * @param {string} input The entire standard input.
 * @returns {string} The build order or IMPOSSIBLE.
 */
function solve(input) {
    const lines = input.trim().split('\n');
    if (lines.length < 2)
        return "IMPOSSIBLE";
    const [N, M] = lines[0].split(' ').map(Number);
    const tasks = lines[1].split(' ');
    // 1. Graph representation: A -> [B, C...]
    const adjacencyList = new Map();
    const inDegree = new Map();
    for (const task of tasks) {
        adjacencyList.set(task, new Set());
        inDegree.set(task, 0);
    }
    // 2. Build graph and in-degree map from dependency edges
    for (let i = 2; i < lines.length; i++) {
        const [A, B] = lines[i].split(' ');
        if (!A || !B)
            continue;
        // Edge A -> B means A must finish before B
        adjacencyList.get(A)?.add(B);
        inDegree.set(B, inDegree.get(B) + 1);
    }
    // 3. Initialize Priority Queue (MinHeap) with tasks having 0 in-degree
    const pq = new PriorityQueue();
    for (const [task, degree] of inDegree.entries()) {
        if (degree === 0) {
            pq.enqueue(task);
        }
    }
    const buildOrder = [];
    // 4. Core Kahn's algorithm loop
    while (pq.dequeue()) {
        const task = pq.dequeue();
        if (!task)
            break;
        buildOrder.push(task);
        const prerequisites = adjacencyList.get(task);
        if (prerequisites) {
            for (const neighbor of prerequisites) {
                let currentInDegree = inDegree.get(neighbor) || 0;
                let newInDegree = currentInDegree - 1;
                inDegree.set(neighbor, newInDegree);
                // If a neighbor's in-degree drops to 0, it's now available
                // and we must enqueue it while ensuring it's not already there.
                if (newInDegree === 0) {
                    if (!pq.has(neighbor)) {
                        pq.enqueue(neighbor);
                    }
                }
            }
        }
    }
    // 5. Check for cycle
    if (buildOrder.length !== N) {
        return "IMPOSSIBLE";
    }
    return buildOrder.join(" ");
}
try {
    const fs = await fs.promises.readFile(0, "utf8");
    console.log(solve(fs));
}
catch (e) {
    console.error("Failed to read input:", e);
}
