import * as fs from 'fs';

class MinHeap {
    private data: string[];

    constructor() {
        this.data = [];
    }

    private swap(i: number, j: number) {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }

    private parent(i: number): number {
        return (i - 1) >> 1;
    }

    private left(i: number): number {
        return 2 * i + 1;
    }

    private right(i: number): number {
        return 2 * i + 2;
    }

    push(val: string) {
        this.data.push(val);
        this._siftUp(this.data.length - 1);
    }

    pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        const root = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this._siftDown(0);
        }
        return root;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }

    private _siftUp(i: number) {
        while (i > 0) {
            const p = this.parent(i);
            if (this.data[p] > this.data[i]) {
                this.swap(p, i);
                i = p;
            } else {
                break;
            }
        }
    }

    private _siftDown(i: number) {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l] < this.data[smallest]) {
                smallest = l;
            }
            if (r < n && this.data[r] < this.data[smallest]) {
                smallest = r;
            }
            if (smallest !== i) {
                this.swap(i, smallest);
                i = smallest;
            } else {
                break;
            }
        }
    }
}

function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;

    const tokens = input.split(/\s+/);
    let idx = 0;

    const N = parseInt(tokens[idx++], 10);
    const M = parseInt(tokens[idx++], 10);

    const tasks: string[] = new Array(N);
    const nameToIndex = new Map<string, number>();

    for (let i = 0; i < N; i++) {
        tasks[i] = tokens[idx++];
        nameToIndex.set(tasks[i], i);
    }

    const adj: number[][] = Array.from({ length: N }, () => []);
    const inDegree: number[] = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const u = tokens[idx++];
        const v = tokens[idx++];
        const uIdx = nameToIndex.get(u)!;
        const vIdx = nameToIndex.get(v)!;
        adj[uIdx].push(vIdx);
        inDegree[vIdx]++;
    }

    const heap = new MinHeap();
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(tasks[i]);
        }
    }

    const result: string[] = [];

    while (!heap.isEmpty()) {
        const u = heap.pop();
        if (u === undefined) break;
        
        const uIdx = nameToIndex.get(u)!;
        result.push(u);

        for (const vIdx of adj[uIdx]) {
            inDegree[vIdx]--;
            if (inDegree[vIdx] === 0) {
                heap.push(tasks[vIdx]);
            }
        }
    }

    if (result.length < N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(' '));
    }
}

main();
