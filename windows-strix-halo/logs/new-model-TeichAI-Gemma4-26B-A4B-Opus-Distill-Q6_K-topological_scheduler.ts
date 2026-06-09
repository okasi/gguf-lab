import * as fs from "fs";

class MinHeap {
  private heap: string[] = [];
  push(val: string) {
    this.heap.push(val);
    let idx = this.heap.length - 1;
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this.heap[idx] < this.heap[parent]) {
        const tmp = this.heap[idx];
        this.heap[idx] = this.heap[parent];
        this.heap[parent] = tmp;
        idx = parent;
      } else break;
    }
  }
  pop(): string | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      let idx = 0;
      while (true) {
        let smallest = idx;
        const left = 2 * idx + 1;
        const right = 2 * idx + 2;
        if (left < this.heap.length && this.heap[left] < this.heap[smallest]) smallest = left;
        if (right < this.heap.length && this.heap[right] < this.heap[smallest]) smallest = right;
        if (smallest !== idx) {
          const tmp = this.heap[idx];
          this.heap[idx] = this.heap[smallest];
          this.heap[smallest] = tmp;
          idx = smallest;
        } else break;
      }
    }
    return top;
  }
  get size(): number { return this.heap.length; }
}

function solve() {
  let input = "";
  try {
    input = fs.readFileSync(0, "utf8");
  } catch (err) {
    return;
  }
  if (!input) return;
  const tokens = input.trim().split(/\s+/);
  if (tokens.length < 2) return;
  let ptr = 0;
  const N = parseInt(tokens[ptr++], 10);
  const M = parseInt(tokens[ptr++], 10);
  if (isNaN(N) || isNaN(M)) return;

  const tasks: string[] = [];
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (let i = 0; i < N; i++) {
    const task = tokens[ptr++];
    if (task !== undefined) {
      tasks.push(task);
      inDegree.set(task, 0);
      adj.set(task, []);
    }
  }

  for (let i = 0; i < M; i++) {
    const u = tokens[ptr++];
    const v = tokens[ptr++];
    if (u === undefined || v === undefined) break;
    const neighbors = adj.get(u);
    if (neighbors) {
      neighbors.push(v);
      inDegree.set(v, (inDegree.get(v) || 0) + 1);
    }
  }

  const pq = new MinHeap();
  for (const t of tasks) {
    if (inDegree.get(t) === 0) {
      pq.push(t);
    }
  }

  const result: string[] = [];
  while (pq.size > 0) {
    const u = pq.pop()!;
    result.push(u);
    const neighbors = adj.get(u);
    if (neighbors) {
      for (const v of neighbors) {
        const d = inDegree.get(v)! - 1;
        inDegree.set(v, d);
        if (d === 0) {
          pq.push(v);
        }
      }
    }
  }

  if (result.length === N) {
    process.stdout.write(result.join(" ") + "\n");
  } else {
    process.stdout.write("IMPOSSIBLE\n");
  }
}

solve();
