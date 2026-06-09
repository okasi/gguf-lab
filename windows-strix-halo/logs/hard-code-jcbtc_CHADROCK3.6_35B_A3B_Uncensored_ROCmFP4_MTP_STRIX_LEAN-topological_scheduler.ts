import * as fs from "fs";

class MinHeap {
  private data: string[] = [];

  constructor() {}

  public size(): number {
    return this.data.length;
  }

  public isEmpty(): boolean {
    return this.data.length === 0;
  }

  public push(item: string): void {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }

  public pop(): string | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const top = this.data[0];
    const last = this.data.pop();
    if (!this.isEmpty() && last !== undefined) {
      this.data[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  public peek(): string | undefined {
    return this.isEmpty() ? undefined : this.data[0];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = (index - 1) >> 1;
      if (this.compare(this.data[index], this.data[parentIndex]) >= 0) {
        break;
      }
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private sinkDown(index: number): void {
    const length = this.data.length;
    while (true) {
      let leftChild = 2 * index + 1;
      let rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < length && this.compare(this.data[leftChild], this.data[smallest]) < 0) {
        smallest = leftChild;
      }
      if (rightChild < length && this.compare(this.data[rightChild], this.data[smallest]) < 0) {
        smallest = rightChild;
      }
      if (smallest === index) {
        break;
      }
      this.swap(index, smallest);
      index = smallest;
    }
  }

  private compare(a: string, b: string): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  private swap(i: number, j: number): void {
    const temp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = temp;
  }
}

function solve(): void {
  const input = fs.readFileSync(0, "utf8").trim().split("\n");
  let lineIndex = 0;

  const firstLine = input[lineIndex++].split(/\s+/).map(Number);
  const N = firstLine[0];
  const M = firstLine[1];

  const taskNamesLine = input[lineIndex++].split(/\s+/);
  const taskNames: string[] = taskNamesLine;

  // Map task name to index 0..N-1
  const nameToIndex: Map<string, number> = new Map();
  for (let i = 0; i < N; i++) {
    nameToIndex.set(taskNames[i], i);
  }

  // Adjacency list and in-degree array
  const adj: number[][] = new Array(N);
  const inDegree: number[] = new Array(N).fill(0);
  for (let i = 0; i < N; i++) {
    adj[i] = [];
  }

  for (let i = 0; i < M; i++) {
    const parts = input[lineIndex++].split(/\s+/);
    const aName = parts[0];
    const bName = parts[1];
    const a = nameToIndex.get(aName)!;
    const b = nameToIndex.get(bName)!;
    adj[a].push(b);
    inDegree[b]++;
  }

  const pq = new MinHeap();
  // Initialize heap with tasks that have in-degree 0
  for (let i = 0; i < N; i++) {
    if (inDegree[i] === 0) {
      pq.push(taskNames[i]);
    }
  }

  const result: string[] = [];

  while (!pq.isEmpty()) {
    const currentName = pq.pop()!;
    const currentIndex = nameToIndex.get(currentName)!;
    result.push(currentName);

    for (const neighbor of adj[currentIndex]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        pq.push(taskNames[neighbor]);
      }
    }
  }

  if (result.length !== N) {
    console.log("IMPOSSIBLE");
  } else {
    console.log(result.join(" "));
  }
}

solve();
