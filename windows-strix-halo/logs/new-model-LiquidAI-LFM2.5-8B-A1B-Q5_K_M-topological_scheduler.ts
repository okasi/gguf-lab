import fs from 'fs';

class MinHeap {
  private arr: string[];
  constructor() { this.arr = []; }
  push(x: string): void {
    this.arr.push(x);
    this.heapifyDown();
  }
  pop(): string | null {
    if (this.arr.length === 0) return null;
    const root = this.arr.shift();
    const n = this.arr.length;
    let i = 0;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.arr[left] < this.arr[smallest]) smallest = left;
      if (right < n && this.arr[right] < this.arr[smallest]) smallest = right;
      if (smallest !== i) {
        [this.arr[i], this.arr[smallest]] = [this.arr[smallest], this.arr[i]];
        i = smallest;
      } else break;
    }
    return root;
  }
  heapifyDown(): void {
    let i = this.arr.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.arr[parent] > this.arr[i]) {
        [this.arr[parent], this.arr[i]] = [this.arr[i], this.arr[parent]];
        i = parent;
      } else break;
    }
  }
  heapifyUp(): void {
    let i = this.arr.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.arr[parent] > this.arr[i]) {
        [this.arr[parent], this.arr[i]] = [this.arr[i], this.arr[parent]];
        i = parent;
      } else break;
    }
  }
  size(): number {
    return this.arr.length;
  }
}

function main() {
  const data = fs.readFileSync(0, "utf8").trim().split(/\s+/);
  if (data.length === 0) return;
  const it = data.begin();
  const N = Number(it++);
  const M = Number(it++);
  const tasks: Set<string> = new Set<string>();
  for (let i = 0; i < N; i++) {
    tasks.add(it++);
  }
  const adjacency = new Map<string, Set<string>>();
  const indegree = new Map<string, number>();
  for (const key of tasks) {
    indegree.set(key, 0);
    adjacency.set(key, new Set<string>());
  }
  while (it < data.length) {
    const A = it++;
    const B = it++;
    if (!adjacency.has(A)) adjacency.set(A, new Set<string>());
    if (!adjacency.has(B)) adjacency.set(B, new Set<string>());
    adjacency.get(A).add(B);
    indegree.set(B, (indegree.get(B) ?? 0) + 1);
  }

  const heap = new MinHeap();
  for (const [task, deg] of indegree.entries()) {
    if (deg === 0) heap.push(task);
  }
  const result: string[] = [];
  while (heap.size() > 0) {
    const task = heap.pop();
    result.push(task);
    for (const neighbor of adjacency.get(task) ?? []) {
      indegree.set(neighbor, (indegree.get(neighbor) ?? 0) - 1);
      if (indegree.get(neighbor) === 0) {
        heap.push(neighbor);
      }
    }
  }

  if (result.length !== N) {
    console.log("IMPOSSIBLE");
  } else {
    console.log(result.join(' '));
  }
}

main();
