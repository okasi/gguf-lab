import * as fs from 'fs';

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
  private head: Node | null;
  private tail: Node | null;
  private map: Map<string, Node>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.size = 0;
    this.head = null;
    this.tail = null;
    this.map = new Map();
  }

  private addNode(node: Node): void {
    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
  }

  private removeNode(node: Node): void {
    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    node.prev = null;
    node.next = null;
  }

  private moveNodeToHead(node: Node): void {
    this.removeNode(node);
    this.addNode(node);
  }

  get(key: string): number {
    const node = this.map.get(key);
    if (!node) {
      return -1;
    }
    this.moveNodeToHead(node);
    return node.value;
  }

  put(key: string, value: number): void {
    const node = this.map.get(key);
    if (node) {
      node.value = value;
      this.moveNodeToHead(node);
    } else {
      const newNode = new Node(key, value);
      this.map.set(key, newNode);
      this.addNode(newNode);
      this.size++;

      if (this.size > this.capacity) {
        const tailNode = this.tail!;
        this.map.delete(tailNode.key);
        this.removeNode(tailNode);
        this.size--;
      }
    }
  }

  remove(key: string): void {
    const node = this.map.get(key);
    if (node) {
      this.removeNode(node);
      this.map.delete(key);
      this.size--;
    }
  }

  getKeys(): string[] {
    const keys: string[] = [];
    let current = this.head;
    while (current) {
      keys.push(current.key);
      current = current.next;
    }
    return keys;
  }
}

function main(): void {
  const input = fs.readFileSync(0, 'utf8').trim();
  const lines = input.split('\n');
  const [firstLine] = lines;
  const [capacityStr, nStr] = firstLine.split(' ');
  const capacity = parseInt(capacityStr, 10);
  const n = parseInt(nStr, 10);

  const cache = new LRUCache(capacity);
  const getResults: number[] = [];

  for (let i = 1; i <= n; i++) {
    const line = lines[i];
    const parts = line.split(' ');
    const operation = parts[0];
    const key = parts[1];
    if (operation === 'PUT') {
      const value = parseInt(parts[2], 10);
      cache.put(key, value);
    } else if (operation === 'GET') {
      const result = cache.get(key);
      getResults.push(result);
    } else if (operation === 'DEL') {
      cache.remove(key);
    }
  }

  if (getResults.length === 0) {
    console.log('EMPTY');
  } else {
    console.log(getResults.join(' '));
  }

  const keys = cache.getKeys();
  if (keys.length === 0) {
    console.log('EMPTY');
  } else {
    console.log(keys.join(' '));
  }
}

main();
