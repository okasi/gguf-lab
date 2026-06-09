import * as fs from 'fs';

class MinHeap<T> {
  private heap: T[];

  constructor() {
    this.heap = [];
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  peek(): T {
    return this.heap[0];
  }

  pop(): T {
    if (this.isEmpty()) {
      throw new Error('Heap is empty');
    }
    const result = this.heap[0];
    const last = this.heap[this.heap.length - 1];
    this.heap.pop();

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }

    return result;
  }

  push(item: T): void {
    this.heap.push(item);
    this.siftUp(this.heap.length - 1);
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index] < this.heap[parent]) {
        [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
        index = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left < length && this.heap[left] < this.heap[smallest]) {
        smallest = left;
      }
      if (right < length && this.heap[right] < this.heap[smallest]) {
        smallest = right;
      }
      if (smallest === index) {
        break;
      }
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

function main(): void {
  const data = fs.readFileSync(0, 'utf8').trim().split('\n');
  if (data.length < 2) {
    console.log('IMPOSSIBLE');
    return;
  }

  const [N, M] = data[0].split(' ').map(Number);
  const tasks = data[1].split(' ').map((t) => t.trim());

  const adj: Map<string, Set<string>> = new Map();
  const inDegree: Map<string, number> = new Map();

  for (const task of tasks) {
    if (!adj.has(task)) {
      adj.set(task, new Set());
    }
    if (!inDegree.has(task)) {
      inDegree.set(task, 0);
    }
  }

  for (let i = 2; i < data.length; i++) {
    const line = data[i].trim();
    if (!line) continue;
    const [A, B] = line.split(' ').map((t) => t.trim());
    if (!adj.has(A) || !adj.has(B)) continue;
    adj.get(A)!.add(B);
    inDegree.set(B, (inDegree.get(B) ?? 0) + 1);
  }

  const heap = new MinHeap<string>();
  for (const [task, degree] of inDegree.entries()) {
    if (degree === 0) {
      heap.push(task);
    }
  }

  const result: string[] = [];
  while (!heap.isEmpty()) {
    const task = heap.pop();
    result.push(task);
    const neighbors = adj.get(task);
    if (neighbors) {
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
        if (newDegree === 0) {
          heap.push(neighbor);
          inDegree.set(neighbor, newDegree);
        }
      }
    }
  }

  if (result.length < N) {
    console.log('IMPOSSIBLE');
  } else {
    console.log(result.join(' '));
  }
}

main();
