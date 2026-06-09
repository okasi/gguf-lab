import * as fs from 'fs';

class MinHeap<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    push(val: T): void {
        this.heap.push(val);
        this.bubbleUp();
    }

    pop(): T | undefined {
        if (this.size() === 0) return undefined;
        const top = this.heap[0];
        const bottom = this.heap.pop()!;
        if (this.size() > 0) {
            this.heap[0] = bottom;
            this.bubbleDown();
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp(): void {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            let parentIdx = (idx - 1) >> 1;
            if (this.compare(this.heap[idx], this.heap[parentIdx]) < 0) {
                [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                idx = parentIdx;
            } else break;
        }
    }

    private bubbleDown(): void {
        let idx = 0;
        const length = this.heap.length;
        while (true) {
            let left = (idx << 1) + 1;
            let right = (idx << 1) + 2;
            let swap = -1;

            if (left < length) {
                if (this.compare(this.heap[left], this.heap[idx]) < 0) {
                    swap = left;
                }
            }

            if (right < length) {
                if (
                    (swap === -1 && this.compare(this.heap[right], this.heap[idx]) < 0) ||
                    (swap !== -1 && this.compare(this.heap[right], this.heap[left]) < 0)
                ) {
                    swap = right;
                }
            }

            if (swap === -1) break;
            [this.heap[idx], this.heap[swap]] = [this.heap[swap], this.heap[idx]];
            idx = swap;
        }
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.split(/\s+/);
    let cursor = 0;

    if (tokens[cursor] === "") cursor++;
    if (cursor >= tokens.length) return;

    const N = parseInt(tokens[cursor++]);
    const M = parseInt(tokens[cursor++]);

    if (isNaN(N)) return;

    const taskNames: string[] = [];
    const nameToIndex = new Map<string, number>();

    for (let i = 0; i < N; i++) {
        const name = tokens[cursor++];
        taskNames.push(name);
        nameToIndex.set(name, i);
    }

    const adj: number[][] = Array.from({ length: N }, () => []);
    const inDegree: number[] = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const uName = tokens[cursor++];
        const vName = tokens[cursor++];
        const u = nameToIndex.get(uName)!;
        const v = nameToIndex.get(vName)!;
        adj[u].push(v);
        inDegree[v]++;
    }

    const pq = new MinHeap<string>((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    // We need to map indices to names for the priority queue to ensure lexicographical order
    // But the problem says "choose the lexicographically smallest task name".
    // So we push the names directly into the MinHeap.
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push(taskNames[i]);
        }
    }

    const result: string[] = [];
    const nameToIndexRef = new Map<string, number>(); 
    // Re-mapping isn't needed if we use names in PQ, but we need to update in-degrees of neighbors
    // To do that efficiently, we need the index. Let's store {name, index} in PQ.
}

// Refined solve to handle object in Heap
function solveCorrect() {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.split(/\s+/);
    let cursor = 0;

    while (cursor < tokens.length && tokens[cursor] === "") cursor++;
    if (cursor >= tokens.length) return;

    const N = parseInt(tokens[cursor++]);
    const M = parseInt(tokens[cursor++]);

    const taskNames: string[] = [];
    const nameToIndex = new Map<string, number>();

    for (let i = 0; i < N; i++) {
        const name = tokens[cursor++];
        taskNames.push(name);
        nameToIndex.set(name, i);
    }

    const adj: number[][] = Array.from({ length: N }, () => []);
    const inDegree: number[] = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const uName = tokens[cursor++];
        const vName = tokens[cursor++];
        const u = nameToIndex.get(uName)!;
        const v = nameToIndex.get(vName)!;
        adj[u].push(v);
        inDegree[v]++;
    }

    interface Task {
        name: string;
        index: number;
    }

    const pq = new MinHeap<Task>((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            pq.push({ name: taskNames[i], index: i });
        }
    }

    const result: string[] = [];
    while (pq.size() > 0) {
        const curr = pq.pop()!;
        result.push(curr.name);

        for (const neighborIdx of adj[curr.index]) {
            inDegree[neighborIdx]--;
            if (inDegree[neighborIdx] === 0) {
                pq.push({ name: taskNames[neighborIdx], index: neighborIdx });
            }
        }
    }

    if (result.length === N) {
        process.stdout.write(result.join(" ") + "\n");
    } else {
        process.stdout.write("IMPOSSIBLE\n");
    }
}

solveCorrect();
