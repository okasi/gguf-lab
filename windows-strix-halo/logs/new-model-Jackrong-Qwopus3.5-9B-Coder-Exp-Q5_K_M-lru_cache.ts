import * as fs from 'fs';

interface CacheNode {
  key: string;
  value: number;
  prev: CacheNode | null;
  next: CacheNode | null;
}

class LRUCache {
  private capacity: number;
  private map: Map<string, CacheNode>;
  private head: CacheNode | null;
  private tail: CacheNode | null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = null;
    this.tail = null;
  }

  private addToHead(node: CacheNode) {
    node.prev = null;
    node.next = this.head;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: CacheNode) {
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
  }

  private evict() {
    if (this.tail && this.tail !== this.head) {
      const node = this.tail;
      this.removeNode(node);
      this.map.delete(node.key);
    }
  }

  put(key: string, value: number) {
    const existingNode = this.map.get(key);
    if (existingNode) {
      existingNode.value = value;
      this.removeNode(existingNode);
      this.addToHead(existingNode);
    } else {
      const newNode = { key, value, prev: null, next: null };
      this.addToHead(newNode);
      this.map.set(key, newNode);
      if (this.map.size > this.capacity) {
        this.evict();
      }
    }
  }

  get(key: string): number {
    const node = this.map.get(key);
    if (!node) return -1;
    this.removeNode(node);
    this.addToHead(node);
    return node.value;
  }

  delete(key: string) {
    const node = this.map.get(key);
    if (node) {
      this.removeNode(node);
      this.map.delete(key);
    }
  }

  getKeys() {
    const keys: string[] = [];
    let node = this.head;
    while (node) {
      keys.push(node.key);
      node = node.next;
    }
    return keys;
  }
}

const input = fs.readFileSync(0, 'utf8');
const lines = input.trim().split('\n');
const [C, N] = lines[0].split(' ').map(Number);
const cache = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
  const parts = lines[i].split(' ');
  const command = parts[0];
  const key = parts[1];
  
  switch (command) {
    case 'PUT':
      const value = parseInt(parts[2], 10);
      cache.put(key, value);
      break;
    case 'GET':
      const result = cache.get(key);
      getResults.push(result);
      break;
    case 'DEL':
      cache.delete(key);
      break;
  }
}

const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
const keysOutput = cache.getKeys().length > 0 ? cache.getKeys().join(' ') : 'EMPTY';

console.log(getOutput);
console.log(keysOutput);
