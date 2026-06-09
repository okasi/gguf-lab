import * as fs from 'fs';

// Node for doubly linked list
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

// LRU Cache implementation
class LRUCache {
  private capacity: number;
  private map: Map<string, Node>;
  private head: Node; // dummy head
  private tail: Node; // dummy tail
  private size: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.size = 0;

    // Create dummy head and tail
    this.head = new Node('', 0);
    this.tail = new Node('', 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // Move node to most recently used position (right before tail)
  private moveToMRU(node: Node): void {
    // Remove node from its current position
    node.prev!.next = node.next;
    node.next!.prev = node.prev;

    // Insert node right before tail (MRU position)
    node.next = this.tail;
    node.prev = this.tail.prev;
    this.tail.prev!.next = node;
    this.tail.prev = node;
  }

  put(key: string, value: number): void {
    if (this.map.has(key)) {
      // Update existing key
      const node = this.map.get(key)!;
      node.value = value;
      this.moveToMRU(node);
    } else {
      // Create new node and add to MRU position
      const newNode = new Node(key, value);
      this.moveToMRU(newNode);
      this.map.set(key, newNode);
      this.size++;

      // Evict LRU if over capacity
      if (this.size > this.capacity) {
        const lruNode = this.head.next;
        if (lruNode && lruNode !== this.tail) {
          this.map.delete(lruNode.key);
          this.removeNode(lruNode);
          this.size--;
        }
      }
    }
  }

  get(key: string): number {
    if (!this.map.has(key)) {
      return -1;
    }
    const node = this.map.get(key)!;
    this.moveToMRU(node);
    return node.value;
  }

  del(key: string): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      this.removeNode(node);
      this.map.delete(key);
      this.size--;
    }
  }

  private removeNode(node: Node): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  getKeys(): string[] {
    // Return keys from MRU to LRU (excluding dummy nodes)
    const keys: string[] = [];
    let current = this.tail.prev;
    while (current && current !== this.head) {
      keys.push(current.key);
      current = current.prev;
    }
    return keys;
  }
}

// Main execution
const input = fs.readFileSync(0, 'utf8').trim().split('\n');
const [capacityStr, nStr] = input[0].split(' ');
const capacity = parseInt(capacityStr);
const n = parseInt(nStr);

const cache = new LRUCache(capacity);
const getResult: number[] = [];

for (let i = 1; i <= n; i++) {
  const line = input[i].split(' ');
  const operation = line[0];
  const key = line[1];

  if (operation === 'PUT') {
    const value = parseInt(line[2]);
    cache.put(key, value);
  } else if (operation === 'GET') {
    const result = cache.get(key);
    getResult.push(result);
  } else if (operation === 'DEL') {
    cache.del(key);
  }
}

// Output GET results
if (getResult.length === 0) {
  console.log('EMPTY');
} else {
  console.log(getResult.join(' '));
}

// Output remaining keys
const remainingKeys = cache.getKeys();
if (remainingKeys.length === 0) {
  console.log('EMPTY');
} else {
  console.log(remainingKeys.join(' '));
}
