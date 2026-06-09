import * as fs from 'fs';

class MinHeap<T> {
  private heap: T[] = [];

  insert(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  extract(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const result = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return result;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex] > this.heap[index]) {
        [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;
      let smallest = index;

      if (leftIndex < length && this.heap[leftIndex] < this.heap[smallest]) {
        smallest = leftIndex;
      }
      if (rightIndex < length && this.heap[rightIndex] < this.heap[smallest]) {
        smallest = rightIndex;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}

const input = fs.readFileSync(0, 'utf8').trim().split('\n');

const [N, M] = input[0].split(' ').map(Number);
const taskNames = input[1].split(' ');

const taskToIndex = new Map<string, number>();
taskNames.forEach((name, i) => taskToIndex.set(name, i));

const graph = new Array<Set<number>>(N);
const inDegree = new Array<number>(N);

for (let i = 0; i < N; i++) {
  graph[i] = new Set();
  inDegree[i] = 0;
}

for (let i = 2; i < input.length; i++) {
  const [A, B] = input[i].split(' ').map(Number);
  graph[A].add(B);
  inDegree[B]++;
}

const heap = new MinHeap<number>();

for (let i = 0; i < N; i++) {
  if (inDegree[i] === 0) {
    heap.insert(i);
  }
}

const result: string[] = [];
let processedCount = 0;

while (!heap.isEmpty()) {
  const taskIndex = heap.extract()!;
  result.push(taskNames[taskIndex]);
  processedCount++;

  for (const neighbor of graph[taskIndex]) {
    inDegree[neighbor]--;
    if (inDegree[neighbor] === 0) {
      heap.insert(neighbor);
    }
  }
}

if (processedCount < N) {
  process.stdout.write('IMPOSSIBLE\n');
} else {
  process.stdout.write(result.join(' ') + '\n');
}
