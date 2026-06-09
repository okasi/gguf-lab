import { readFileSync } from 'fs';

class LRUCache {
  private capacity: number;
  private map: Map<string, Node>;
  private head: Node;
  private tail: Node;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node();
    this.tail = new Node();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private makeMostRecentlyUsed(key: string) {
    const node = this.map.get(key);
    if (!node) return;

    // Remove from current position
    const prevNode = node.prev;
    const nextNode = node.next;
    prevNode.next = nextNode;
    nextNode.prev = prevNode;

    // Add to head position (most recently used)
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  put(key: string, value: number) {
    if (this.map.has(key)) {
      this.map.get(key)!.value = value;
      this.makeMostRecentlyUsed(key);
    } else {
      const node = new Node(key, value);
      this.map.set(key, node);
      // Add to head position
      node.prev = this.head;
      node.next = this.head.next;
      this.head.next.prev = node;
      this.head.next = node;

      if (this.map.size > this.capacity) {
        // Evict least recently used (tail)
        const evicted = this.tail.prev;
        this.map.delete(evicted.key);
        evicted.prev.next = evicted.next;
        evicted.next.prev = evicted.prev;
      }
    }
  }

  get(key: string): number {
    if (!this.map.has(key)) return -1;
    this.makeMostRecentlyUsed(key);
    return this.map.get(key)!.value;
  }

  del(key: string) {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.prev.next = node.next;
      node.next.prev = node.prev;
      this.map.delete(key);
    }
  }

  getRemainingKeys(): string[] {
    const keys: string[] = [];
    let current = this.head.next;
    while (current !== this.tail) {
      keys.push(current.key);
      current = current.next;
    }
    return keys;
  }
}

class Node {
  key: string;
  value: number;
  next: Node;
  prev: Node;

  constructor(key: string, value: number) {
    this.key = key;
    this.value = value;
    this.next = null!;
    this.prev = null!;
  }
}

// Main logic
const input = readFileSync(0, 'utf8');
const lines = input.trim().split('\n');
const [capacityStr, nStr] = lines[0].split(' ');
const capacity = parseInt(capacityStr);
const n = parseInt(nStr);

const getResults: number[] = [];
const cache = new LRUCache(capacity);

for (let i = 1; i <= n; i++) {
  const [op, key] = lines[i].split(' ');
  if (op === 'PUT') {
    const value = parseInt(key);
    cache.put(key, value);
  } else if (op === 'GET') {
    const value = cache.get(key);
    getResults.push(value);
  } else if (op === 'DEL') {
    cache.del(key);
  }
}

const outputLines: string[] = [];
if (getResults.length === 0) {
  outputLines.push('EMPTY');
} else {
  outputLines.push(getResults.join(' '));
}

const remainingKeys = cache.getRemainingKeys();
if (remainingKeys.length === 0) {
  outputLines.push('EMPTY');
} else {
  outputLines.push(remainingKeys.join(' '));
}

console.log(outputLines.join('\n'));
