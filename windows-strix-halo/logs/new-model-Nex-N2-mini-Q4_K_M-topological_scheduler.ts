import * as fs from "fs";

class MinBinaryHeap {
  private data: string[];
  private compare: (a: string, b: string) => number;

  constructor(compare: (a: string, b: string) => number) {
    this.data = [];
    this.compare = compare;
  }

  get size(): number {
    return this.data.length;
  }

  push(value: string): void {
    this.data.push(value);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): string | undefined {
    if (this.data.length === 0) return undefined;
    const root = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0 && last !== undefined) {
      this.data[0] = last;
      this.bubbleDown(0);
    }
    return root;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.data[index], this.data[parent]) >= 0) break;
      [this.data[index], this.data[parent]] = [this.data[parent], this.data[index]];
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.data.length;
    while (true) {
      let smallest = index;
      const left = index * 2 + 1;
      const right = index * 2 + 2;

      if (left < length && this.compare(this.data[left], this.data[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.compare(this.data[right], this.data[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
      index = smallest;
    }
  }
}

const input = fs.readFileSync(0, "utf8");
const tokens = input.trim().split(/\s+/);

if (tokens.length === 0) {
  process.stdout.write("");
  process.exit(0);
}

const N = Number(tokens[0]);
const M = Number(tokens[1]);
let index = 2;

const tasks = tokens.slice(index, index + N);
index += N;

const taskIndex = new Map<string, number>();
for (let i = 0; i < N; i++) {
  taskIndex.set(tasks[i], i);
}

const indegree = new Array<number>(N).fill(0);
const adjacency = new Map<string, string[]>();
for (const task of tasks) {
  adjacency.set(task, []);
}

for (let i = 0; i < M; i++) {
  const a = tokens[index++];
  const b = tokens[index++];
  adjacency.get(a)!.push(b);
  indegree[taskIndex.get(b)!]++;
}

const heap = new MinBinaryHeap((a, b) => a < b ? -1 : a > b ? 1 : 0);
for (const task of tasks) {
  if (indegree[taskIndex.get(task)!] === 0) {
    heap.push(task);
  }
}

const order: string[] = [];

while (heap.size > 0) {
  const current = heap.pop()!;
  order.push(current);

  for (const next of adjacency.get(current)!) {
    const nextIndex = taskIndex.get(next)!;
    indegree[nextIndex]--;
    if (indegree[nextIndex] === 0) {
      heap.push(next);
    }
  }
}

if (order.length < N) {
  process.stdout.write("IMPOSSIBLE\n");
} else {
  process.stdout.write(order.join(" ") + "\n");
}
