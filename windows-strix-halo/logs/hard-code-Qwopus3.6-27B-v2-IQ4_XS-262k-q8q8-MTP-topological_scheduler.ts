import fs from "fs";

class MinHeap {
  private data: string[] = [];

  private swap(i: number, j: number): void {
    const temp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = temp;
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.data[parent] > this.data[index]) {
        this.swap(parent, index);
        index = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    const length = this.data.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.data[left] < this.data[smallest]) {
        smallest = left;
      }

      if (right < length && this.data[right] < this.data[smallest]) {
        smallest = right;
      }

      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  push(item: string): void {
    this.data.push(item);
    this.siftUp(this.data.length - 1);
  }

  pop(): string | undefined {
    if (this.data.length === 0) {
      return undefined;
    }
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0 && last !== undefined) {
      this.data[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  peek(): string | undefined {
    return this.data.length > 0 ? this.data[0] : undefined;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  size(): number {
    return this.data.length;
  }
}

function solve(): void {
  const input = fs.readFileSync(0, "utf8").trim();
  if (!input) {
    return;
  }

  const lines = input.split(/\r?\n/);
  const [nStr, mStr] = lines[0].split(" ").map(Number);
  const n = nStr;
  const m = mStr;

  const tasks = lines[1].split(" ");
  const adj: Map<string, string[]> = new Map();
  const inDegree: Map<string, number> = new Map();

  for (const task of tasks) {
    adj.set(task, []);
    inDegree.set(task, 0);
  }

  for (let i = 0; i < m; i++) {
    const [u, v] = lines[2 + i].split(" ");
    adj.get(u)!.push(v);
    inDegree.set(v, (inDegree.get(v) || 0) + 1);
  }

  const heap = new MinHeap();
  for (const task of tasks) {
    if (inDegree.get(task) === 0) {
      heap.push(task);
    }
  }

  const result: string[] = [];

  while (!heap.isEmpty()) {
    const current = heap.pop();
    if (current === undefined) {
      break;
    }
    result.push(current);

    const neighbors = adj.get(current);
    if (neighbors) {
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          heap.push(neighbor);
        }
      }
    }
  }

  if (result.length !== n) {
    console.log("IMPOSSIBLE");
  } else {
    console.log(result.join(" "));
  }
}

solve();
