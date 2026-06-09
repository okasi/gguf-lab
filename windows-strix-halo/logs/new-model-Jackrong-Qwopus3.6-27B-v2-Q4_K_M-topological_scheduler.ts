import * as fs from 'fs';

function solve() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) return;
    const tokens = input.split(/\s+/);
    let idx = 0;
    const N = parseInt(tokens[idx++], 10);
    const M = parseInt(tokens[idx++], 10);

    const nameToIdx = new Map<string, number>();
    const idxToName = new Array(N);

    for (let i = 0; i < N; i++) {
        const name = tokens[idx++];
        nameToIdx.set(name, i);
        idxToName[i] = name;
    }

    const adj: number[][] = new Array(N);
    for (let i = 0; i < N; i++) adj[i] = [];
    const inDegree = new Array(N).fill(0);

    for (let i = 0; i < M; i++) {
        const uStr = tokens[idx++];
        const vStr = tokens[idx++];
        const u = nameToIdx.get(uStr)!;
        const v = nameToIdx.get(vStr)!;
        adj[u].push(v);
        inDegree[v]++;
    }

    class MinHeap {
        private heap: number[] = [];
        private idxToName: string[];

        constructor(idxToName: string[]) {
            this.idxToName = idxToName;
        }

        private compare(a: number, b: number): number {
            const nameA = this.idxToName[a];
            const nameB = this.idxToName[b];
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        }

        private swap(i: number, j: number) {
            [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
        }

        push(val: number) {
            this.heap.push(val);
            let i = this.heap.length - 1;
            while (i > 0) {
                const parent = Math.floor((i - 1) / 2);
                if (this.compare(this.heap[i], this.heap[parent]) < 0) {
                    this.swap(i, parent);
                    i = parent;
                } else {
                    break;
                }
            }
        }

        pop(): number {
            if (this.heap.length === 1) return this.heap.pop()!;
            const top = this.heap[0];
            this.heap[0] = this.heap.pop()!;
            let i = 0;
            const size = this.heap.length;
            while (true) {
                let smallest = i;
                const left = 2 * i + 1;
                const right = 2 * i + 2;
                if (left < size && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                    smallest = left;
                }
                if (right < size && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                    smallest = right;
                }
                if (smallest === i) break;
                this.swap(i, smallest);
                i = smallest;
            }
            return top;
        }

        isEmpty(): boolean {
            return this.heap.length === 0;
        }
    }

    const heap = new MinHeap(idxToName);
    for (let i = 0; i < N; i++) {
        if (inDegree[i] === 0) {
            heap.push(i);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const u = heap.pop();
        result.push(idxToName[u]);
        for (const v of adj[u]) {
            inDegree[v]--;
            if (inDegree[v] === 0) {
                heap.push(v);
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
