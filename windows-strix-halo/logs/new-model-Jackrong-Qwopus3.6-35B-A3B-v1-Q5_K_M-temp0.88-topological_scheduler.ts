import * as fs from "fs";

class MinHeap {
    private items: string[] = [];

    push(task: string): void {
        this.items.push(task);
        this.bubbleUp(this.items.length - 1);
    }

    pop(): string | undefined {
        if (this.items.length === 0) return undefined;
        if (this.items.length === 1) return this.items.pop();

        const top = this.items[0];
        this.items[0] = this.items.pop()!;
        this.bubbleDown(0);
        return top;
    }

    size(): number {
        return this.items.length;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.items[parentIndex] <= this.items[index]) break;
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    private bubbleDown(index: number): void {
        const length = this.items.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (left < length && this.items[smallest] > this.items[left]) {
                smallest = left;
            }
            if (right < length && this.items[smallest] > this.items[right]) {
                smallest = right;
            }

            if (smallest === index) break;
            this.swap(index, smallest);
            index = smallest;
        }
    }

    private swap(i: number, j: number): void {
        [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;

    const tokens = input.split(/\s+/);
    let ptr = 0;

    const N = parseInt(tokens[ptr++]);
    const M = parseInt(tokens[ptr++]);

    const tasks: string[] = [];
    for (let i = 0; i < N; i++) {
        tasks.push(tokens[ptr++]);
    }

    const adj: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    for (const task of tasks) {
        adj.set(task, []);
        inDegree.set(task, 0);
    }

    for (let i = 0; i < M; i++) {
        const a = tokens[ptr++];
        const b = tokens[ptr++];
        adj.get(a)!.push(b);
        inDegree.set(b, inDegree.get(b)! + 1);
    }

    const heap = new MinHeap();
    for (const task of tasks) {
        if (inDegree.get(task)! === 0) {
            heap.push(task);
        }
    }

    const result: string[] = [];
    while (heap.size() > 0) {
        const task = heap.pop()!;
        result.push(task);

        for (const neighbor of adj.get(task)!) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) {
                heap.push(neighbor);
            }
        }
    }

    if (result.length !== N) {
        console.log("IMPOSSIBLE");
    } else {
        console.log(result.join(" "));
    }
}

main();
