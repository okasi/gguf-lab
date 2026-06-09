import * as fs from 'fs';

class MinHeap {
    private data: string[] = [];

    push(item: string): void {
        this.data.push(item);
        this.siftUp(this.data.length - 1);
    }

    pop(): string {
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.siftDown(0);
        }
        return top;
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }

    private siftUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[index] < this.data[parentIndex]) {
                this.swap(index, parentIndex);
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

            if (left < length && this.data[left] < this.data[smallest]) {
                smallest = left;
            }
            if (right < length && this.data[right] < this.data[smallest]) {
                smallest = right;
            }

            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }

    private swap(i: number, j: number): void {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (input.length === 0) return;

    const lines = input.split(/\r?\n/);
    const [N, M] = lines[0].split(" ").map(Number);

    if (N === 0) {
        console.log("");
        return;
    }

    const tasks = lines[1].split(" ");
    const inDegree: Map<string, number> = new Map();
    const adj: Map<string, string[]> = new Map();

    for (const t of tasks) {
        inDegree.set(t, 0);
        adj.set(t, []);
    }

    for (let i = 0; i < M; i++) {
        const [u, v] = lines[i + 2].split(" ");
        adj.get(u)!.push(v);
        inDegree.set(v, inDegree.get(v)! + 1);
    }

    const pq = new MinHeap();
    for (const t of tasks) {
        if (inDegree.get(t) === 0) {
            pq.push(t);
        }
    }

    const result: string[] = [];
    while (!pq.isEmpty()) {
        const current = pq.pop();
        result.push(current);
        for (const neighbor of adj.get(current)!) {
            const newDegree = inDegree.get(neighbor)! - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) {
                pq.push(neighbor);
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
