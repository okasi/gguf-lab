import * as fs from 'fs';

class DoublyLinkedListNode {
  key: string;
  value: number;
  prev: DoublyLinkedListNode | null;
  next: DoublyLinkedListNode | null;

  constructor(key: string, value: number) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  private capacity: number;
  private count: number;
  private head: DoublyLinkedListNode;
  private tail: DoublyLinkedListNode;
  private map: Map<string, DoublyLinkedListNode>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.count = 0;
    this.map = new Map();

    // Create sentinel nodes
    this.head = new DoublyLinkedListNode('', 0);
    this.tail = new DoublyLinkedListNode('', 0);

    // Link sentinel nodes
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private addToFront(node: DoublyLinkedListNode): void {
    node.next = this.head.next;
    node.prev = this.head;

    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: DoublyLinkedListNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToFront(node: DoublyLinkedListNode): void {
    this.removeNode(node);
    this.addToFront(node);
  }

  private evictTail(): void {
    const node = this.tail.prev;
    if (node && node !== this.tail) {
      this.removeNode(node);
      this.map.delete(node.key);
      this.count--;
    }
  }

  put(key: string, value: number): void {
    const existingNode = this.map.get(key);
    if (existingNode) {
      existingNode.value = value;
      this.moveToFront(existingNode);
      return;
    }

    const newNode = new DoublyLinkedListNode(key, value);
    this.map.set(key, newNode);
    this.addToFront(newNode);
    this.count++;

    if (this.count > this.capacity) {
      this.evictTail();
    }
  }

  get(key: string): number {
    const existingNode = this.map.get(key);
    if (!existingNode) {
      return -1;
    }

    this.moveToFront(existingNode);
    return existingNode.value;
  }

  del(key: string): void {
    const existingNode = this.map.get(key);
    if (existingNode) {
      this.removeNode(existingNode);
      this.map.delete(key);
      this.count--;
    }
  }

  getKeysInOrder(): string[] {
    const keys: string[] = [];
    let current = this.head.next;

    while (current && current !== this.tail) {
      keys.push(current.key);
      current = current.next;
    }

    return keys;
  }
}

function main(): void {
  const input = fs.readFileSync(0, 'utf8').trim();
  const lines = input.split('\n');

  if (lines.length === 0) {
    return;
  }

  const [C_str, N_str] = lines[0].split(' ');
  const C = parseInt(C_str, 10);
  const N = parseInt(N_str, 10);

  const cache = new LRUCache(C);
  const getResults: number[] = [];

  for (let i = 1; i <= N && i < lines.length; i++) {
    const parts = lines[i].trim().split(' ');
    const operation = parts[0];
    const key = parts[1];

    if (operation === 'PUT') {
      const value = parseInt(parts[2], 10);
      cache.put(key, value);
    } else if (operation === 'GET') {
      const result = cache.get(key);
      getResults.push(result);
    } else if (operation === 'DEL') {
      cache.del(key);
    }
  }

  if (getResults.length === 0) {
    console.log('EMPTY');
  } else {
    console.log(getResults.join(' '));
  }

  const keys = cache.getKeysInOrder();
  if (keys.length === 0) {
    console.log('EMPTY');
  } else {
    console.log(keys.join(' '));
  }
}

main();
