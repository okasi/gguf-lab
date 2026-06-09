import * as fs from 'fs';

function main() {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split(/\r?\n/);
    let lineIdx = 0;
    if (lines[lineIdx].trim() === '') lineIdx++;
    const [N, M] = lines[lineIdx++].trim().split(/\s+/).map(Number);
    const taskNamesLine = lines[lineIdx++].trim();
    const tasks = taskNamesLine.split(/\s+/).filter(Boolean);

    const adj = new Map<string, string[]>();
    const indegree = new Map<string, number>();
    for (const t of tasks) {
        adj.set(t, []);
        indegree.set(t, 0);
    }
    for (let i = 0; i < M; i++) {
        const edgeLine = lines[lineIdx++].trim();
        const [A, B] = edgeLine.split(/\s+/);
        adj.get(A)!.push(B);
        indegree.set(B, (indegree.get(B)! || 0) + 1);
    }

    class MinHeap {
        private data: string[];
        private compare: (a: string, b: string) => number;

        constructor(compare: (a: string, b: string) => number) {
            this.data = [];
            this.compare = compare;
        }

        push(value: string): void {
            this.data.push(value);
            this.siftUp(this.data.length - 1);
        }

        pop(): string | undefined {
            if (this.data.length === 0) return undefined;
            const top = this.data[0];
            const last = this.data.pop()!;
            if (this.data.length > 0) {
                this.data[0] = last;
                this.siftDown(0);
            }
            return top;
        }

        peek(): string | undefined {
            return this.data.length > 0 ? this.data[0] : undefined;
        }

        isEmpty(): boolean {
            return this.data.length === 0;
        }

        private siftUp(index: number): void {
            while (index > 0) {
                const parentIndex = (index - 1) >> 1;
                if (this.compare(this.data[index], this.data[parentIndex]) < 0) {
                    const temp = this.data[index];
                    this.data[index] = this.data[parentIndex];
                    this.data[parentIndex] = temp;
                    index = parentIndex;
                } else {
                    break;
                }
            }
        }

        private siftDown(index: number): void {
            const length = this.data.length;
            while (true) {
                let smallest = index;
                const left = 2 * index + 1;
                const right = 2 * index + 2;
                if (left < length && this.compare(this.data[left], this.data[smallest]) < 0) {
                    smallest = left;
                }
                if (right < length && this.compare(this.data[right], this.data[smallest]) < 0) {
                    smallest = right;
                }
                if (smallest !== index) {
                    const temp = this.data[index];
                    this.data[index] = this.data[smallest];
                    this.data[smallest] = temp;
                    index = smallest;
                } else {
                    break;
                }
            }
        }
    }

    const heap = new MinHeap((a: string, b: string) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });

    for (const t of tasks) {
        if (indegree.get(t)! === 0) {
            heap.push(t);
        }
    }

    const result: string[] = [];
    while (!heap.isEmpty()) {
        const u = heap.pop()!;
        result.push(u);
        for (const v of adj.get(u)!) {
            const newDeg = indegree.get(v)! - 1;
            indegree.set(v, newDeg);
            if (newDeg === 0) {
                heap.push(v);
            }
        }
    }

    if (result.length === N) {
        console.log(result.join(' '));
    } else {
        console.log('IMPOSSIBLE');
    }
}

main();
