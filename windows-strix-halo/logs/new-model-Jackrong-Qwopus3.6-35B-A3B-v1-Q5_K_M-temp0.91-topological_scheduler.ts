import * as fs from 'fs';

class MinHeap {
    private heap: string[] = [];

    public push(val: string): void {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    public pop(): string {
        if (this.heap.length === 0) {
            throw new Error("Cannot pop from empty heap");
        }
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0 && last !== top) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    public peek(): string | undefined {
        return this.heap[0];
    }

    public get size(): number {
        return this.heap.length;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parentIdx = Math.floor((i - 1) / 2);
            if (this.heap[i] < this.heap[parentIdx]) {
                [this.heap[i], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[i]];
                i = parentIdx;
            } else {
                break;
            }
        }
    }

    private bubbleDown(i: number): void {
        const length = this.heap.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }

            if (smallest !== i) {
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
                i = smallest;
            } else {
                break;
            }
        }
    }
}

function solve(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (input.length === 0) return;

    const lines = input.split("\n");
    const [N_str, M_str] = lines[0].split(" ");
    const N = parseInt(N_str, 10);
    const M = parseInt(M_str, 10);

    const tasks = N > 0 ? lines[1].split(" ") : [];
    const adj = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    for (const task of tasks) {
        adj.set(task, new Set());
        inDegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const edgeLine = lines[1 + i + 1];
        if (!edgeLine) continue;
        const [A, B] = edgeLine.split(" ");
        if (!adj.has(A)) adj.set(A, new Set());
        if (!adj.has(B)) adj.set(B, new Set());
        if (!adj.get(A)!.has(B)) {
            adj.get(A)!.add(B);
            inDegree.set(B, (inDegree.get(B) || 0) + 1);
        }
    }

    const pq = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task) === 0) {
            pq.push(task);
        }
    }

    const result: string[] = [];
    while (pq.size > 0) {
        const task = pq.pop();
        result.push(task);
        const neighbors = adj.get(task);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const deg = inDegree.get(neighbor);
                if (deg !== undefined) {
                    inDegree.set(neighbor, deg - 1);
                    if (deg - 1 === 0) {
                        pq.push(neighbor);
                    }
                }
            }
        }
    }

    if (result.length < N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

solve();
