import { readFileSync } from 'fs';

class PriorityQueue {
  private heap: string[];

  constructor() {
    this.heap = [];
  }

  peek(): string | null {
    if (this.heap.length === 0) return null;
    return this.heap[0];
  }

  pop(): string | null {
    if (this.heap.length === 0) return null;
    const result = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapify(0);
    return result;
  }

  push(value: string): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  empty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.heap[parent] <= this.heap[current]) break;
      [this.heap[parent], this.heap[current]] = [this.heap[current], this.heap[parent]];
      current = parent;
    }
  }

  private heapify(index: number): void {
    let current = index;
    while (true) {
      const left = 2 * current + 1;
      const right = 2 * current + 2;
      let smallest = current;

      if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
        smallest = left;
      }
      if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
        smallest = right;
      }

      if (smallest === current) break;

      [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
      current = smallest;
    }
  }
}

function main() {
  const lines = readFileSync(0, 'utf8').split('\n');
  const input = lines.filter(line => line.length > 0 && line.trim() !== '');

  if (input.length < 2) {
    if (input.length === 0) {
      console.log('');
      return;
    }
    console.log('IMPOSSIBLE');
    return;
  }

  const [nStr, mStr] = input[0].trim().split(/\s+/).map(Number);
  const n = nStr;
  const m = mStr;

  const taskNames = input[1].trim().split(/\s+/).filter(s => s !== '');

  if (taskNames.length !== n) {
    console.log('IMPOSSIBLE');
    return;
  }

  if (n === 0) {
    console.log('');
    return;
  }

  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const task of taskNames) {
    adj.set(task, []);
    inDegree.set(task, 0);
  }

  for (let i = 0; i < m; i++) {
    if (i + 2 >= input.length) break;
    const line = input[i + 2].trim();
    const parts = line.split(/\s+/);
    const a = parts[0];
    const b = parts[1];

    if (a && b && adj.has(a) && adj.has(b)) {
      adj.get(a)!.push(b);
      inDegree.get(b)!.++;
    }
  }

  const pq = new PriorityQueue();
  for (const task of taskNames) {
    if (inDegree.get(task) === 0) {
      pq.push(task);
    }
  }

  const result: string[] = [];
  while (!pq.empty()) {
    const task = pq.pop()!;
    result.push(task);
    const neighbors = adj.get(task) || [];
    for (const neighbor of neighbors) {
      const newInDegree = inDegree.get(neighbor)! - 1;
      if (newInDegree === 0) {
        pq.push(neighbor);
      }
    }
  }

  if (result.length !== n) {
    console.log('IMPOSSIBLE');
  } else {
    console.log(result.join(' '));
  }
}

main();
