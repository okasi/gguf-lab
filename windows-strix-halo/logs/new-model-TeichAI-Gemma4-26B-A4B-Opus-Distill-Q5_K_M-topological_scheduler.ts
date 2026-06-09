import * as fs from 'fs';

class MinHeap<T> {
  private heap: T[] = [];
  constructor(private compare: (a: T, b: T) => number) {}

  push(val: T): void {
    this.heap.push(val);
    this.bubbleUp();
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown();
    return top;
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp(): void {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.compare(this.heap[index], this.heap[parent]) < 0) {
        const tmp = this.heap[index];
        this.heap[index] = this.heap[parent];
        this.heap[parent] = tmp;
        index = parent;
      } else break;
    }
  }

  private bubbleDown(): void {
    let index = 0;
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = (index << 1) + 1;
      const right = (index << 1) + 2;
      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left;
      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right;
      if (smallest !== index) {
        const tmp = this.heap[index];
        this.heap[index] = this.heap[smallest];
        this.heap[smallest] = tmp;
        index = smallest;
      } else break;
    }
  }
}

function solve(): void {
  const input = fs.readFileSync(0, "utf8");
  const tokens = input.split(/\s+/).filter(s => s !== "");
  if (tokens.length === 0) return;

  let idx = 0;
  const n = parseInt(tokens[idx++], 10);
  const m = parseInt(tokens[idx++], 10);

  if (isNaN(n)) return;

  const tasks: string[] = [];
  for (let i = 0; i < n; i++) {
    tasks.push(tokens[idx++]);
  }

  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const t of tasks) {
    adj.set(t, []);
    inDegree.set(t, 0);
  }

  for (let i = 0; i < m; i++) {
    const u = tokens[idx++];
    const v = tokens[idx++];
    if (u !== undefined && v !== undefined) {
      if (adj.has(u)) {
        adj.get(u)!.push(v);
        inDegree.set(v, (inDegree.get(v) || 0) + 1);
      }
    }
  }

  const pq = new MinHeap<string>((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  for (const t of tasks) {
    if (inDegree.get(t) === 0) {
      pq.push(t);
    }
  }

  const result: string[] = [];
  while (pq.size() > 0) {
    const u = pq.pop()!;
    result.push(u);

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      const currentInDegree = inDegree.get(v)! - 1;
      inDegree.set(v, currentInDegree);
      if (currentInDegree === 0) {
        pq.push(v);
      }
    }
  }

  if (result.length === n) {
    process.stdout.write(result.join(" ") + "\n");
  } else {
    process.stdout.write("IMPOSSIBLE\n");
  }
}

solve();
