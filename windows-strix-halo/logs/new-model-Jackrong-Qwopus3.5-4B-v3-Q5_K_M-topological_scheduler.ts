import fs from 'fs';

class MinHeap {
  private data: string[];
  private len: number;

  constructor(data?: string[]) {
    this.data = data ? [...data] : [];
    this.len = 0;
    this.heapify();
  }

  private heapify() {
    for (let i = Math.floor(this.len / 2) - 1; i >= 0; i--) {
      this.sink(i);
    }
  }

  private sink(i: number) {
    let target = i;
    while (2 * i + 1 < this.len) {
      let child = 2 * i + 1;
      if (child + 1 < this.len) {
        if (this.compare(this.data[child + 1], this.data[child])) {
          child++;
        }
      }
      if (this.compare(this.data[target], this.data[child])) {
        break;
      }
      this.swap(target, child);
      target = child;
    }
  }

  private heapifyUp(i: number) {
    while (i > 0 && this.compare(this.data[i], this.data[this.parent(i)])) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  private parent(i: number) {
    return Math.floor((i - 1) / 2);
  }

  private compare(a: string, b: string): boolean {
    return a < b;
  }

  private swap(i: number, j: number) {
    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
  }

  public push(item: string): void {
    this.data.push(item);
    this.len++;
    this.heapifyUp(this.len - 1);
  }

  public pop(): string | undefined {
    if (this.len === 0) return undefined;
    const result = this.data[0];
    this.data[0] = this.data[this.len - 1];
    this.len--;
    this.data.pop();
    if (this.len > 0) {
      this.sink(0);
    }
    return result;
  }

  public isEmpty(): boolean {
    return this.len === 0;
  }
}

function solve(): void {
  const content = fs.readFileSync(0, 'utf8');
  const lines = content.trim().split('\n');

  if (lines.length < 2) return;

  const [nStr] = lines[0].trim().split(/\s+/);
  const n = parseInt(nStr, 10);
  const tasks = lines[1].trim().split(/\s+/).filter(s => s.length > 0);
  const m = parseInt(lines[2].trim(), 10);

  const adj = new Map<string, Set<string>>();
  const indegree = new Map<string, number>();
  const edgeSet = new Set<string>();

  for (const task of tasks) {
    adj.set(task, new Set());
    indegree.set(task, 0);
  }

  for (let i = 3; i <= lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    const from = parts[0];
    const to = parts[1];
    const edgeKey = `${from}|${to}`;

    if (edgeSet.has(edgeKey)) continue;
    edgeSet.add(edgeKey);

    adj.get(from)!.add(to);
    indegree.set(to, (indegree.get(to) || 0) + 1);
  }

  const heap = new MinHeap();

  for (const task of tasks) {
    if (indegree.get(task) === 0) {
      heap.push(task);
    }
  }

  const result: string[] = [];
  while (!heap.isEmpty()) {
    const task = heap.pop()!;
    result.push(task);

    const neighbors = adj.get(task);
    if (neighbors) {
      for (const neighbor of neighbors) {
        const newIndegree = indegree.get(neighbor) - 1;
        indegree.set(neighbor, newIndegree);
        if (newIndegree === 0) {
          heap.push(neighbor);
        }
      }
    }
  }

  if (result.length !== n) {
    console.log('IMPOSSIBLE');
  } else {
    console.log(result.join(' '));
  }
}

solve();
