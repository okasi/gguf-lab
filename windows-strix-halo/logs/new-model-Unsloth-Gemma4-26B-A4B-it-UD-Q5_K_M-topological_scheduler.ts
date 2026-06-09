import * as fs from 'fs';

class MinHeap {
    private heap: string[] = [];

    push(val: string): void {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.heap[index] < this.heap[parentIndex]) {
                const temp = this.heap[index];
                this.heap[index] = this.heap[parentIndex];
                this.heap[parentIndex] = temp;
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        while (true) {
            let smallest = index;
            const left = (index << 1) + 1;
            const right = (index << 1) + 2;

            if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }

            if (smallest !== index) {
                const temp = this.heap[index];
                this.heap[index] = this.heap[smallest];
                this.heap[smallest] = temp;
                index = smallest;
            } else {
                break;
            }
        }
    }
}

function solve(): void {
    let input: string;
    try {
        input = fs.readFileSync(0, "utf8");
    } catch (e) {
        return;
    }
    
    const tokens = input.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) return;

    let cursor = 0;
    const N = parseInt(tokens[cursor++], 10);
    const M = parseInt(tokens[cursor++], 10);

    if (isNaN(N)) return;

    const tasks: string[] = [];
    for (let i = 0; i < N; i++) {
        tasks.push(tokens[cursor++]);
    }

    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const u = tokens[cursor++];
        const v = tokens[cursor++];
        if (u !== undefined && v !== undefined) {
            const neighbors = adj.get(u);
            if (neighbors) {
                neighbors.push(v);
                inDegree.set(v, (inDegree.get(v) || 0) + 1);
            }
        }
    }

    const pq = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }

    const result: string[] = [];
    while (pq.size() > 0) {
        const u = pq.pop()!;
        result.push(u);

        const neighbors = adj.get(u);
        if (neighbors) {
            for (const v of neighbors) {
                const currentDeg = inDegree.get(v) || 0;
                const newDeg = currentDeg - 1;
                inDegree.set(v, newDeg);
                if (newDeg === 0) {
                    pq.push(v);
                }
            }
        }
    }

    if (result.length === N) {
        process.stdout.write(result.join(' ') + '\n');
    } else {
        process.stdout.write("IMPOSSIBLE\n");
    }
}

solve();
