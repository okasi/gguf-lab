import fs from 'fs';

class LRUList {
  private readonly capacity: number;
  private readonly map: Map<string, LRUNode>;
  private readonly head: LRUNode;
  private readonly tail: LRUNode;
  private size: number = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new LRUNode();
    this.tail = new LRUNode();
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  add(key: string, value: number): void {
    const node = new LRUNode();
    node.key = key;
    node.value = value;
    this.map.set(key, node);

    const prev = this.head;
    const next = this.head.next;
    prev.next = node;
    node.prev = prev;
    node.next = next;
    next.prev = node;

    this.size++;
  }

  moveToMRU(key: string): void {
    const node = this.map.get(key)!;
    this.remove(node);
    this.add(key, node.value);
  }

  remove(node: LRUNode): void {
    const prev = node.prev;
    const next = node.next;
    prev.next = next;
    next.prev = prev;
    this.map.delete(node.key);
    this.size--;
  }

  evict(): void {
    if (this.size === 0) return;
    const node = this.tail.prev;
    this.remove(node);
  }

  isFull(): boolean {
    return this.size >= this.capacity;
  }

  size(): number {
    return this.size;
  }

  getKeys(): string[] {
    const keys: string[] = [];
    let current = this.head.next;
    while (current !== this.tail) {
      keys.push(current.key);
      current = current.next;
    }
    return keys;
  }
}

class LRUNode {
  key: string;
  value: number;
  prev: LRUNode;
  next: LRUNode;

  constructor() {
    this.key = '';
    this.value = 0;
    this.prev = null as any;
    this.next = null as any;
  }
}

const data = fs.readFileSync(0, 'utf8');
const lines = data.trim().split('\n');
const [C, N] = lines[0].split(' ').map(Number);

const list = new LRUList(C);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
  const parts = lines[i].split(' ');
  const op = parts[0];
  const key = parts[1];

  if (op === 'GET') {
    if (!list.map.has(key)) {
      getResults.push(-1);
    } else {
      list.moveToMRU(key);
      getResults.push(list.map.get(key)!.value);
    }
  } else if (op === 'PUT') {
    const value = parseInt(parts[2]);
    if (list.map.has(key)) {
      list.moveToMRU(key);
      list.map.get(key)!.value = value;
    } else {
      if (list.size() >= list.capacity) {
        list.evict();
      }
      list.add(key, value);
    }
  } else if (op === 'DEL') {
    if (list.map.has(key)) {
      list.remove(list.map.get(key)!);
    }
  }
}

if (getResults.length === 0) {
  console.log('EMPTY');
} else {
  console.log(getResults.join(' '));
}

const keys = list.getKeys();
if (keys.length === 0) {
  console.log('EMPTY');
} else {
  console.log(keys.join(' '));
}
