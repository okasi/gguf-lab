import * as fs from 'fs';

interface Node {
  key: string;
  value: number;
  prev: Node | null;
  next: Node | null;
}

class LRUCache {
  private capacity: number;
  private map: Map<string, Node>;
  private head: Node;
  private tail: Node;
  private size: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map<string, Node>();
    this.head = { key: '', value: 0, prev: null, next: null };
    this.tail = { key: '', value: 0, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  private removeNode(node: Node): void {
    const { prev, next } = node;
    if (prev) prev.next = next;
    if (next) next.prev = prev;
  }

  private addToFront(node: Node): void {
    node.next = this.head.next;
    node.prev = this.head;
    if (this.head.next) this.head.next.prev = node;
    this.head.next = node;
  }

  private moveToFront(node: Node): void {
    if (node === this.head.next) return;
    this.removeNode(node);
    this.addToFront(node);
  }

  private removeLast(): Node | null {
    const last = this.tail.prev;
    if (last && last !== this.head) {
      this.removeNode(last);
      this.size--;
      return last;
    }
    return null;
  }

  get(key: string): number {
    const node = this.map.get(key);
    if (node) {
      this.moveToFront(node);
      return node.value;
    }
    return -1;
  }

  put(key: string, value: number): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.moveToFront(existing);
      return;
    }

    if (this.size >= this.capacity) {
      const evicted = this.removeLast();
      if (evicted) {
        this.map.delete(evicted.key);
      }
    }

    const newNode: Node = { key, value, prev: null, next: null };
    this.addToFront(newNode);
    this.map.set(key, newNode);
    this.size++;
  }

  delete(key: string): boolean {
    const node = this.map.get(key);
    if (node) {
      this.removeNode(node);
      this.map.delete(key);
      this.size--;
      return true;
    }
    return false;
  }

  getKeys(): string[] {
    const keys: string[] = [];
    let curr = this.head.next;
    while (curr !== this.tail) {
      keys.push(curr.key);
      curr = curr.next;
    }
    return keys;
  }
}

function main(): void {
  const input = fs.readFileSync(0, 'utf8');
  const lines = input.trim().split('\n');
  if (lines.length < 1) return;

  const [capacityStr, numOpsStr] = lines[0].split(' ');
  const capacity = parseInt(capacityStr, 10);
  const numOps = parseInt(numOpsStr, 10);

  const cache = new LRUCache(capacity);
  const getResults: number[] = [];

  for (let i = 1; i <= numOps; i++) {
    const parts = lines[i].split(' ');
    const op = parts[0];
    if (op === 'PUT') {
      const key = parts[1];
      const value = parseInt(parts[2], 10);
      cache.put(key, value);
    } else if (op === 'GET') {
      const key = parts[1];
      const result = cache.get(key);
      getResults.push(result);
    } else if (op === 'DEL') {
      const key = parts[1];
      cache.delete(key);
    }
  }

  const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
  const keys = cache.getKeys();
  const keysOutput = keys.length > 0 ? keys.join(' ') : 'EMPTY';

  console.log(getOutput);
  console.log(keysOutput);
}

main();
