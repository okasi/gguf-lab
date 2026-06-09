import * as fs from "fs";

// Custom Min-Heap implementation for lexicographical ordering
class MinHeap {
    private heap: string[] = [];

    push(item: string): void {
        this.heap.push(item);
        this.siftUp(this.heap.length - 1);
    }

    pop(): string | undefined {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const top = this.heap[0];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.siftDown(0);
        return top;
    }

    get isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private siftUp(i: number): void {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.heap[i] < this.heap[parent]) {
                const temp = this.heap[i];
                this.heap[i] = this.heap[parent];
                this.heap[parent] = temp;
                i = parent;
            } else {
                break;
            }
        }
    }

    private siftDown(i: number): void {
        const n = this.heap.length;
        while (2 * i + 1 < n) {
            let j = 2 * i + 1;
            if (j + 1 < n && this.heap[j + 1] < this.heap[j]) {
                j++;
            }
            if (this.heap[i] > this.heap[j]) {
                const temp = this.heap[i];
                this.heap[i] = this.heap[j];
                this.heap[j] = temp;
                i = j;
            } else {
                break;
            }
        }
    }
}

function main(): void {
    const lines = fs.readFileSync(0, "utf8").trim().split("\n").filter(l => l.trim().length > 0);
    const [N, M] = lines[0].trim().split(" ").map(Number);
    const tasks = lines[1].trim().split(" ");

    const nameToIndex = new Map<string, number>();
    for (let i = 0; i < N; i++) {
        nameToIndex.set(tasks[i], i);
    }

    const adj: number[][] = new Array(N).fill(null).map(() => []);
    const inDegree: number[] = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const [a, b] = lines[2 + i].trim().split(" ");
        const u = nameToIndex.get(a)!;
        const v = nameToIndex.get(b)!;
        adj[u].push(v);
        inDegree[v]++;
    }

    const heap = new MinHeap();
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(tasks[i]);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty) {
        const u = heap.pop()!;
        result.push(u);

        const uIdx = nameToIndex.get(u)!;
        for (let j = 0; j < adj[uIdx].length; j++) {
            const v = adj[uIdx][j];
            inDegree[v]--;
            if (inDegree[v] === 0) {
                heap.push(tasks[v]);
            }
        }
    }

    if (result.length < N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

main();
