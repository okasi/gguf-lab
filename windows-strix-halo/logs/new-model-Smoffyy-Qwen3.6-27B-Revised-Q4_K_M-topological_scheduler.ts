import fs from 'fs';

class MinHeap {
  private data: number[] = [];
  private compare: (a: number, b: number) => boolean;

  constructor(compare: (a: number, b: number) => boolean) {
    this.compare = compare;
  }

  push(val: number): void {
    this.data.push(val);
    this.siftUp(this.data.length - 1);
  }

  pop(): number | undefined {
    if (this.data.length === 0) return undefined;
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

  private siftUp(idx: number): void {
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this.compare(this.data[idx], this.data[parent])) {
        [this.data[idx], this.data[parent]] = [this.data[parent], this.data[idx]];
        idx = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(idx: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && this.compare(this.data[left], this.data[smallest])) {
        smallest = left;
      }
      if (right < n && this.compare(this.data[right], this.data[smallest])) {
        smallest = right;
      }
      if (smallest !== idx) {
        [this.data[idx], this.data[smallest]] = [this.data[smallest], this.data[idx]];
        idx = smallest;
      } else {
        break;
      }
    }
  }
}

function main(): void {
  const input = fs.readFileSync(0, 'utf8').trim();
  if (!input) return;
  const tokens = input.split(/\s+/);
  let ptr = 0;
  const N = parseInt(tokens[ptr++], 10);
  const M = parseInt(tokens[ptr++], 10);

  const taskNames = tokens.slice(ptr, ptr + N);
  ptr += N;

  const nameToIdx = new Map<string, number>();
  for (let i = 0; i < N; i++) {
    nameToIdx.set(taskNames[i], i);
  }

  const adj: number[][] = Array.from({ length: N }, () => []);
  const inDegree = new Array(N).fill(0);

  for (let i = 0; i < M; i++) {
    const u = nameToIdx.get(tokens[ptr++])!;
    const v = nameToIdx.get(tokens[ptr++])!;
    adj[u].push(v);
    inDegree[v]++;
  }

  const heap = new MinHeap((a, b) => taskNames[a] < taskNames[b]);
  for (let i = 0; i < N; i++) {
    if (inDegree[i] === 0) {
      heap.push(i);
    }
  }

  const result: string[] = [];
  let processedCount = 0;

  while (!heap.isEmpty()) {
    const u = heap.pop()!;
    result.push(taskNames[u]);
    processedCount++;
    for (const v of adj[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) {
        heap.push(v);
      }
    }
  }

  if (processedCount < N) {
    console.log('IMPOSSIBLE');
  } else {
    console.log(result.join(' '));
  }
}

main();
