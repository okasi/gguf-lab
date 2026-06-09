import * as fs from 'fs';
import { createInterface } from 'readline';

/**
 * Min-Heap implementation for storing Task Names.
 * Comparison is lexicographical (string comparison).
 * Time complexity for insert/extractMin: O(log N).
 */
class MinPriorityQueue<T extends string> {
    private heap = [] as T[];
    public get size(): number {
        return this.heap.length;
    }

    /**
     * Compares two elements and returns true if a should be prioritized (smaller).
     * For strings, lexicographical comparison is used.
     */
    private compare<T>(a: T, b: T): boolean {
        return (a as string).localeCompare(b as string) < 0;
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

    private swap<T>(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private bubbleUp<T>(index: number): void {
        let currentIndex = index;
        while (
            currentIndex > 0 &&
            this.heap[this.getParentIndex(currentIndex)]
                .localeCompare(this.heap[currentIndex]) < 0
        ) {
            this.bubbleUp(this.getParentIndex(currentIndex));
            this.swap(this.getParentIndex(currentIndex)),
            currentIndex = this.getParentIndex(currentIndex);
        }
    }

    private sinkDown<T>(index: number): void {
        let currentIndex = index;
        while (
            this.heap[currentIndex]
                .localeCompare(this.heap[this.getLeftChildIndex(currentIndex)] ?? '')
                > 0 ||
            this.heap[this.getRightChildIndex(currentIndex)] ?? ''
                .localeCompare(this.heap[this.getLeftChildIndex(currentIndex)] ?? '')
                > 0
        ) {
            const leftChildIndex = this.getLeftChildIndex(currentIndex);
            const rightChildIndex = this.getRightChildIndex(currentIndex);
            
            let smallest = leftChildIndex;
            
            // Check if right child is smaller than left
            if (this.heap[this.getRightChildIndex(currentIndex)] ?? ''
                .localeCompare(this.heap[this.getLeftChildIndex(currentIndex)] ?? '')) {
                    smallest = this.getRightChildIndex(currentIndex);
                }

            this.swap(this.heap[currentIndex], this.heap[smallest]);
            currentIndex = this.heap[smallest].parent;
        }
    }

    public insert<T>(element: T): void {
        this.heap.push(element as any);
        this.bubbleUp(this.heap.length - 1);
    }

    public extractMin<T>(): T | undefined {
        const min = this.heap.shift();
        const last = this.heap[this.heap.length - 1];
        
        if (this.heap.length > 0) {
            this.heap[this.heap.length - 1] = last;
            this.sinkDown(this.heap.length - 1);
        }

        return min;
    }

    public peek<T>(): T | undefined {
        return this.heap[0];
    }

    public peekParentIndex<T>(): number | undefined {
        return this.heap[0]?.parent;
    }
}


/**
 * Main function to read input and perform Topological Sort with lexicographical tie-breaking.
 */
function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    
    if (input.length === 0) {
        console.log('');
        return;
    }

    const [N, M] = input[0].split(' ').map(Number);

    if (N === 0) {
        console.log('');
        return;
    }

    // Task names are in line 2
    const taskNames = input[1].split(' ');
    
    // Graph representation: Map TaskName -> [TaskName] (tasks that depend on this task)
    const adj = new Map<string, string[]>();
    
    // In-degree map: TaskName -> count of tasks it depends on
    const inDegree = new Map<string, number>();

    // Initialize structures for all tasks
    for (const taskName of taskNames) {
        adj.set(taskName, []);
        inDegree.set(taskName, 0);
    }

    // Parse dependency edges
    for (let i = 2; i < input.length; i++) {
        const [A, B] = input[i].split(' ');
        // A must finish before B starts
        // Edge: A -> B
        adj.get(A)?.push(B);
        inDegree.set(B, inDegree.get(B) + 1);
    }

    // 1. Initialize Priority Queue (Min-Heap) with tasks having in-degree 0.
    // Priority is lexicographical (string comparison).
    const priorityQueue = new MinPriorityQueue<string>();

    for (const [taskName, degree] of inDegree.entries()) {
        if (degree === 0) {
            priorityQueue.insert(taskName);
        }
    }

    // 2. Kahn's algorithm modified for lexicographical tie-breaking
    const buildOrder: string[] = [];
    
    while (priorityQueue.size > 0) {
        const taskName = priorityQueue.extractMin()!;
        
        buildOrder.push(taskName);

        // 3. Process tasks that depend on the completed one
        const dependents = adj.get(taskName) ?? [];
        for (const dependentTaskName of dependents) {
            let currentInDegree = inDegree.get(dependentTaskName)!;
            currentInDegree--;
            inDegree.set(dependentTaskName, currentInDegree);

            // If prerequisites are met, add to PQ (priority queue handles tie-breaking)
            if (currentInDegree === 0) {
                priorityQueue.insert(dependentTaskName);
            }
        }
    }

    // 4. Check for cycle
    if (buildOrder.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(buildOrder.join(' '));
    }
}

// Set up standard input reading from file descriptor 0
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: fs.createInterface({
        fd: 0
    }),
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    if (line) {
        // Handle the case where the entire input is available in one go
        // (common in environments that pipe large files to stdin)
        if (rl.question) {
            rl.question('');
        } else {
            // If rl.question is not available, assume all input is done
            rl.close();
        }
    }
});

rl.on('close', solve);

// If running with simple file redirection, solve() might run immediately
// before rl.on('close') fires. We ensure synchronous reading for competitive programming environments.
try {
    const fileContent = fs.readFileSync(0, "utf8");
    if (fileContent.trim()) {
        (global as any)._stdin = fileContent;
        rl.question(''); // Trigger close if no interactive mode
    }
} catch (e) {
    // Ignore file descriptor 0 errors in non-standard environments
}

// Overwrite default readline behavior to use the pre-read content if available
if ((global as any)._stdin) {
    const stdin = ((global as any)._stdin as string).split('\n');
    rl.question = (query: string) => {
        const line = stdin.shift();
        if (line) rl.question(line + '\n');
    };
}

// Execute solve directly for standard environment behavior
solve();

// Export for testing purposes
// export { MinPriorityQueue };
