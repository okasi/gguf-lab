const fs = require('fs');

/**
 * Min-Heap implementation to manage available tasks lexicographically.
 * Operations: push (O(log N)), pop (O(log N))
 */
class MinHeap {
    private heap: string[] = [];

    push(val: string) {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.size() === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.size() > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp(index: number) {
        while (index > 0) {
            let parentIdx = Math.floor((index - 1) / 2);
            if (this.heap[index] < this.heap[parentIdx]) {
                [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
                index = parentIdx;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number) {
        while (true) {
            let smallest = index;
            let left = 2 * index + 1;
            let right = 2 * index + 2;

            if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
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
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    if (input.length === 0 || input[0] === "") return;

    let ptr = 0;
    const N = parseInt(input[ptr++]);
    const M = parseInt(input[ptr++]);

    if (isNaN(N)) return;

    const taskNames = [];
    for (let i = 0; i < N; i++) {
        taskNames.push(input[ptr++]);
    }

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const name of taskNames) {
        adj.set(name, []);
        inDegree.set(name, 0);
    }

    for (let i = 0; i < M; i++) {
        const u = input[ptr++];
        const v = input[ptr++];
        adj.get(u)!.push(v);
        inDegree.set(v, (inDegree.get(v) || 0) + 1);
    }

    const heap = new MinHeap();
    for (const name of taskNames) {
        if (inDegree.get(name) === 0) {
            heap.push(name);
        }
    }

    const result: string[] = [];
    while (heap.size() > 0) {
        const u = heap.pop()!;
        result.push(u);

        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            const currentDegree = inDegree.get(v)! - 1;
            inDegree.set(v, currentDegree);
            if (currentDegree === 0) {
                heap.push(v);
            }
        }
    }

    if (result.length === N) {
        process.stdout.write(result.join(" ") + "\n");
    } else {
        process.stdout.write("IMPOSSIBLE\n");
    }
}

solve();
