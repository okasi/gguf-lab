import fs from "fs";

class MinHeap {
    private data: string[] = [];

    public push(val: string): void {
        this.data.push(val);
        this.bubbleUp(this.data.length - 1);
    }

    public pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.sinkDown(0);
        }
        return top;
    }

    public peek(): string | undefined {
        return this.data[0];
    }

    public isEmpty(): boolean {
        return this.data.length === 0;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.data[parent] <= this.data[i]) break;
            this.swap(parent, i);
            i = parent;
        }
    }

    private sinkDown(i: number): void {
        const n = this.data.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < n && this.data[left] < this.data[smallest]) smallest = left;
            if (right < n && this.data[right] < this.data[smallest]) smallest = right;

            if (smallest === i) break;
            this.swap(i, smallest);
            i = smallest;
        }
    }

    private swap(i: number, j: number): void {
        const tmp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = tmp;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    let lineIdx = 0;

    const firstLine = input[lineIdx++].trim().split(/\s+/);
    const N = parseInt(firstLine[0], 10);
    const M = parseInt(firstLine[1], 10);

    const names = input[lineIdx++].trim().split(/\s+/);
    const nameToIndex = new Map<string, number>();
    for (let i = 0; i < N; i++) {
        nameToIndex.set(names[i], i);
    }

    const adj: number[][] = new Array(N).fill(null).map(() => []);
    const inDegree = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const parts = input[lineIdx++].trim().split(/\s+/);
        const a = parts[0];
        const b = parts[1];
        adj[nameToIndex.get(a)!].push(nameToIndex.get(b)!);
        inDegree[nameToIndex.get(b)!]++;
    }

    const heap = new MinHeap();
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(names[i]);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const name = heap.pop()!;
        result.push(name);
        const idx = nameToIndex.get(name)!;

        for (const neighborIdx of adj[idx]) {
            inDegree[neighborIdx]--;
            if (inDegree[neighborIdx] === 0) {
                heap.push(names[neighborIdx]);
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
