import * as fs from 'fs';

class MinHeap {
    private data: string[];

    constructor() {
        this.data = [];
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

    private swap(i: number, j: number): void {
        const tmp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = tmp;
    }

    private siftUp(i: number): void {
        while (i > 0 && this.data[this.parent(i)] > this.data[i]) {
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    }

    private siftDown(i: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const l = this.left(i);
            const r = this.right(i);
            if (l < n && this.data[l] < this.data[smallest]) smallest = l;
            if (r < n && this.data[r] < this.data[smallest]) smallest = r;
            if (smallest === i) break;
            this.swap(i, smallest);
            i = smallest;
        }
    }

    push(x: string): void {
        this.data.push(x);
        this.siftUp(this.data.length - 1);
    }

    pop(): string {
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    get size(): number {
        return this.data.length;
    }

    get empty(): boolean {
        return this.data.length === 0;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const [N, M] = lines[0].split(' ').map(Number);
    const tasks = lines[1].split(' ');
    const taskIndex = new Map<string, number>();
    for (let i = 0; i < N; i++) {
        taskIndex.set(tasks[i], i);
    }

    const adj: number[][] = Array.from({ length: N }, () => []);
    const inDegree = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const [A, B] = lines[2 + i].split(' ');
        const u = taskIndex.get(A)!;
        const v = taskIndex.get(B)!;
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
    while (!heap.empty) {
        const cur = heap.pop();
        result.push(cur);
        const u = taskIndex.get(cur)!;
        for (const v of adj[u]) {
            inDegree[v]--;
            if (inDegree[v] === 0) {
                heap.push(tasks[v]);
            }
        }
    }

    if (result.length < N) {
        console.log('IMPOSSIBLE');
    } else {
        console.log(result.join(' '));
    }
}

main();
