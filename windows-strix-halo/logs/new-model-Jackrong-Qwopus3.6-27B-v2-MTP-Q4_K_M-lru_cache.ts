import * as fs from 'fs';

function main() {
  const input = fs.readFileSync(0, 'utf8').trim();
  const lines = input.split(/\r?\n/);
  const firstLine = lines[0].split(/\s+/).map(Number);
  const C = firstLine[0];
  const N = firstLine[1];

  const cache = new LRUCache(C);
  const getResults: number[] = [];

  for (let i = 1; i <= N; i++) {
    const line = lines[i].trim();
    const parts = line.split(/\s+/);
    const op = parts[0];
    if (op === 'PUT') {
      const key = parts[1];
      const value = parseInt(parts[2], 10);
      cache.put(key, value);
    } else if (op === 'GET') {
      const key = parts[1];
      const val = cache.get(key);
      getResults.push(val);
    } else if (op === 'DEL') {
      const key = parts[1];
      cache.del(key);
    }
  }

  if (getResults.length === 0) {
    console.log('EMPTY');
  } else {
    console.log(getResults.join(' '));
  }

  const remainingKeys = cache.getKeysMRUtoLRU();
  if (remainingKeys.length === 0) {
    console.log('EMPTY');
  } else {
    console.log(remainingKeys.join(' '));
  }
}

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

class DoublyLinkedList {
  head: Node;
  tail: Node;
  constructor() {
    this.head = new Node('', 0);
    this.tail = new Node('', 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  add(node: Node): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  remove(node: Node): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
    node.prev = null;
    node.next = null;
  }

  moveToFront(node: Node): void {
    this.remove(node);
    this.add(node);
  }

  removeTail(): Node {
    const lru = this.tail.prev!;
    this.remove(lru);
    return lru;
  }
}

class LRUCache {
  capacity: number;
  map: Map<string, Node>;
  list: DoublyLinkedList;
  size: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.list = new DoublyLinkedList();
    this.size = 0;
  }

  put(key: string, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this.list.moveToFront(node);
    } else {
      const node = new Node(key, value);
      this.map.set(key, node);
      this.list.add(node);
      this.size++;
      if (this.size > this.capacity) {
        const lru = this.list.removeTail();
        this.map.delete(lru.key);
        this.size--;
      }
    }
  }

  get(key: string): number {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      this.list.moveToFront(node);
      return node.value;
    } else {
      return -1;
    }
  }

  del(key: string): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      this.list.remove(node);
      this.map.delete(key);
      this.size--;
    }
  }

  getKeysMRUtoLRU(): string[] {
    const keys: string[] = [];
    let cur = this.list.head.next;
    while (cur !== this.list.tail) {
      keys.push(cur.key);
      cur = cur.next!;
    }
    return keys;
  }
}

main();
