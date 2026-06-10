const fs = require('fs');
class MinHeap<T> {
    private heap: T[] = [];
    private size = 0;
    private compare = (a: T, b: T): boolean => a < b;

    push(item: T): void {
        this.heap.push(item);
        this.size++;
        this._siftUp(this.size - 1);
    }

    pop(): T | undefined {
        if (this.size === 0) return undefined;
        const result = this.heap[0];
        this.heap[0] = this.heap[this.size - 1];
        this.heap.pop();
        this._siftDown(0);
        this.size--;
        return result;
    }

    _siftUp(index: number): void {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[parent], this.heap[index])) break;
            [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
            index = parent;
        }
    }

    _siftDown(index: number): void {
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        let smallest = index;
        if (left < this.size && this.compare(this.heap[left], this.heap[smallest])) smallest = left;
        if (right < this.size && this.compare(this.heap[right], this.heap[smallest])) smallest = right;
        if (smallest !== index) {
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            this._siftDown(smallest);
        }
    }

    size(): number { return this.size; }
}

function main() {
    const data = fs.readFileSync(0, "utf8").trim().split(/\s+/);
    if (data.length < 2) {
        console.log("IMPOSSIBLE");
        return;
    }
    let idx = 0;
    const N = parseInt(data[idx++]);
    const M = parseInt(data[idx++]);
    const tasks: string[] = [];
    for (let i = 0; i < N; ++i) tasks.push(data[idx++]);
    const graph = new Map<string, Set<string>>();
    const indeg = new Map<string, number>();
    for (const t of tasks) {
        indeg.set(t, 0);
        graph.set(t, new Set());
    }
    for (let i = 0; i < M; ++i) {
        const A = data[idx++];
        const B = data[idx++];
        if (!graph.has(A)) graph.set(A, new Set());
        if (!graph.has(B)) graph.set(B, new Set());
        graph.get(A).add(B);
        indeg.set(B, (indeg.get(B) || 0) + 1);
    }
    const heap = new MinHeap<string>();
    for (const t of tasks) {
        if (indeg.get(t) === 0) heap.push(t);
    }
    const result: string[] = [];
    while (heap.size() > 0) {
        const node = heap.pop();
        result.push(node);
        if (!graph.has(node)) continue;
        for (const neighbor of graph.get(node)) {
            indeg.set(neighbor, (indeg.get(neighbor) || 0) - 1);
            if (indeg.get(neighbor) === 0) heap.push(neighbor);
        }
    }
    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(' '));
    }
}

if (require.main === module) main();
