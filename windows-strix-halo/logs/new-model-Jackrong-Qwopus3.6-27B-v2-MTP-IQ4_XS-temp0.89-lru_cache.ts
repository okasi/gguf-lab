import fs from 'fs';

class Node {
  key: string;
  value: number;
  prev: Node | null;
  next: Node | null;

  constructor(key: string, value: number) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  private capacity: number;
  private size: number;
  private map: Map<string, Node>;
  private head: Node | null;
  private tail: Node | null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.size = 0;
    this.map = new Map();
    this.head = null;
    this.tail = null;
  }

  get(key: string): number {
    const node = this.map.get(key);
    if (!node) {
      return -1;
    }
    this.moveToFront(node);
    return node.value;
  }

  put(key: string, value: number): void {
    const node = this.map.get(key);
    if (node) {
      node.value = value;
      this.moveToFront(node);
    } else {
      const newNode = new Node(key, value);
      this.map.set(key, newNode);
      this.addToFront(newNode);
      this.size++;
      if (this.size > this.capacity) {
        this.removeTail();
      }
    }
  }

  del(key: string): void {
    const node = this.map.get(key);
    if (!node) {
      return;
    }
    this.removeNode(node);
    this.map.delete(key);
    this.size--;
  }

  getKeys(): string[] {
    const keys: string[] = [];
    let cur: Node | null = this.head;
    while (cur) {
      keys.push(cur.key);
      cur = cur.next;
    }
    return keys;
  }

  private addToFront(node: Node): void {
    if (!this.head) {
      this.head = this.tail = node;
      node.prev = null;
      node.next = null;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
      node.prev = null;
    }
  }

  private removeNode(node: Node): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    node.prev = null;
    node.next = null;
  }

  private moveToFront(node: Node): void {
    if (node === this.head) {
      return;
    }
    this.removeNode(node);
    this.addToFront(node);
  }

  private removeTail(): void {
    if (!this.tail) {
      return;
    }
    const tailNode = this.tail;
    this.removeNode(tailNode);
    this.map.delete(tailNode.key);
    this.size--;
  }
}

function main(): void {
  const input = fs.readFileSync(0, 'utf8').trim();
  const lines = input.split('\n');
  const firstLine = lines[0].split(/\s+/);
  const C = parseInt(firstLine[0], 10);
  const N = parseInt(firstLine[1], 10);
  const cache = new LRUCache(C);
  const getResults: number[] = [];

  for (let i = 1; i <= N; i++) {
    const line = lines[i];
    if (!line) break;
    const parts = line.split(/\s+/);
    const op = parts[0];
    const key = parts[1];
    if (op === 'PUT') {
      const value = parseInt(parts[2], 10);
      cache.put(key, value);
    } else if (op === 'GET') {
      const val = cache.get(key);
      getResults.push(val);
    } else if (op === 'DEL') {
      cache.del(key);
    }
  }

  if (getResults.length === 0) {
    process.stdout.write('EMPTY\n');
  } else {
    process.stdout.write(getResults.join(' ') + '\n');
  }

  const keys = cache.getKeys();
  if (keys.length === 0) {
    process.stdout.write('EMPTY\n');
  } else {
    process.stdout.write(keys.join(' ') + '\n');
  }
}

main();
