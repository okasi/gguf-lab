import * as fs from "fs";

class MinHeap {
    private data: string[] = [];

    private heapifyUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[parentIndex] <= this.data[index]) break;
            this.swap(parentIndex, index);
            index = parentIndex;
        }
    }

    private heapifyDown(index: number): void {
        const length = this.data.length;
        while (true) {
            let smallest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            if (left < length && this.data[left] < this.data[smallest]) smallest = left;
            if (right < length && this.data[right] < this.data[smallest]) smallest = right;
            if (smallest === index) break;
            this.swap(index, smallest);
            index = smallest;
        }
    }

    private swap(i: number, j: number): void {
        const temp = this.data[i];
        this.data[i] = this.data[j];
        this.data[j] = temp;
    }

    push(value: string): void {
        this.data.push(value);
        this.heapifyUp(this.data.length - 1);
    }

    pop(): string | undefined {
        if (this.data.length === 0) return undefined;
        const top = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.heapifyDown(0);
        }
        return top;
    }

    peek(): string | undefined {
        return this.data[0];
    }

    isEmpty(): boolean {
        return this.data.length === 0;
    }
}

const input = fs.readFileSync(0, "utf8").trim().split(/\s+/);
let ptr = 0;

const N = Number(input[ptr++]);
const M = Number(input[ptr++]);

const tasks: string[] = [];
for (let i = 0; i < N; i++) {
    tasks.push(input[ptr++]);
}

const graph = new Map<string, string[]>();
const inDegree = new Map<string, number>();

for (const task of tasks) {
    graph.set(task, []);
    inDegree.set(task, 0);
}

for (let i = 0; i < M; i++) {
    const from = input[ptr++];
    const to = input[ptr++];
    graph.get(from)!.push(to);
    inDegree.set(to, inDegree.get(to)! + 1);
}

const pq = new MinHeap();
for (const task of tasks) {
    if (inDegree.get(task) === 0) {
        pq.push(task);
    }
}

const order: string[] = [];
while (!pq.isEmpty()) {
    const task = pq.pop()!;
    order.push(task);
    for (const neighbor of graph.get(task)!) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor) === 0) {
            pq.push(neighbor);
        }
    }
}

if (order.length !== N) {
    console.log("IMPOSSIBLE");
} else {
    console.log(order.join(" "));
}
