import * as fs from 'fs';

class MinHeap {
  private data: number[];
  private tasks: string[];

  constructor(tasks: string[]) {
    this.tasks = tasks;
    this.data = [];
  }

  push(val: number): void {
    this.data.push(val);
    this.siftUp(this.data.length - 1);
  }

  pop(): number {
    if (this.data.length === 0) throw new Error("Heap empty");
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(i, parent) >= 0) break;
      [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.compare(left, smallest) < 0) smallest = left;
      if (right < n && this.compare(right, smallest) < 0) smallest = right;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }

  private compare(i: number, j: number): number {
    const a = this.tasks[this.data[i]];
    const b = this.tasks[this.data[j]];
    return a < b ? -1 : a > b ? 1 : 0;
  }
}

const input = fs.readFileSync(0, "utf8").trim();
if (!input) process.exit(0);

const tokens = input.split(/\s+/);
let ptr = 0;
const N = Number(tokens[ptr++]);
const M = Number(tokens[ptr++]);

const tasks: string[] = [];
const taskToIdx = new Map<string, number>();
for (let i = 0; i < N; i++) {
  tasks.push(tokens[ptr++]);
  taskToIdx.set(tasks[i], i);
}

const adj: number[][] = Array.from({ length: N }, () => []);
const inDegree = new Array(N).fill(0);

for (let i = 0; i < M; i++) {
  const u = taskToIdx.get(tokens[ptr++])!;
  const v = taskToIdx.get(tokens[ptr++])!;
  adj[u].push(v);
  inDegree[v]++;
}

const heap = new MinHeap(tasks);
for (let i = 0; i < N; i++) {
  if (inDegree[i] === 0) heap.push(i);
}

const result: string[] = [];
while (!heap.isEmpty()) {
  const u = heap.pop();
  result.push(tasks[u]);
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
