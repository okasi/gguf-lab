import { readFileSync } from 'fs';

// Binary heap implementation for priority queue
class MinHeap<T> {
  private heap: T[];
  private compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this.heap = [];
    this.compare = compare;
  }

  push(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  get length(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

// Parse input
const input = readFileSync(0, 'utf8').trim().split('\n');
const [N, M] = input[0].split(' ').map(Number);
const tasks = input[1].split(' ');
const edges: [string, string][] = [];

for (let i = 2; i < 2 + M; i++) {
  const [A, B] = input[i].split(' ');
  edges.push([A, B]);
}

// Build adjacency list and in-degree count
const adjacencyList: Map<string, string[]> = new Map();
const inDegree: Map<string, number> = new Map();

for (const task of tasks) {
  adjacencyList.set(task, []);
  inDegree.set(task, 0);
}

for (const [A, B] of edges) {
  adjacencyList.get(A)!.push(B);
  inDegree.set(B, inDegree.get(B)! + 1);
}

// Initialize priority queue with tasks having no dependencies
const pq = new MinHeap<string>((a, b) => a.localeCompare(b));
for (const task of tasks) {
  if (inDegree.get(task) === 0) {
    pq.push(task);
  }
}

// Perform topological sort
const order: string[] = [];
while (pq.length > 0) {
  const current = pq.pop()!;
  order.push(current);

  for (const neighbor of adjacencyList.get(current)!) {
    inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
    if (inDegree.get(neighbor) === 0) {
      pq.push(neighbor);
    }
  }
}

// Output result
if (order.length !== N) {
  console.log('IMPOSSIBLE');
} else {
  console.log(order.join(' '));
}
