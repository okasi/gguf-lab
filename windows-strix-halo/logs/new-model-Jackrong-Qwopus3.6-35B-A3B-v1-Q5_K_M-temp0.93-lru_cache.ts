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
  private map: Map<string, Node>;
  private head: Node;
  private tail: Node;
  private size: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node('', 0);
    this.tail = new Node('', 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  private addToHead(node: Node): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: Node): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private addToTail(node: Node): void {
    node.prev = this.tail.prev;
    node.next = this.tail;
    this.tail.prev!.next = node;
    this.tail.prev = node;
  }

  private removeTail(): Node {
    const node = this.tail.prev;
    if (node) {
      node.prev!.next = this.tail;
      this.tail.prev = node.prev;
    }
    return node!;
  }

  put(key: string, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      this.removeNode(node);
      node.value = value;
      this.addToHead(node);
    } else {
      if (this.size === this.capacity) {
        const tailNode = this.removeTail();
        this.map.delete(tailNode.key);
        this.size--;
      }
      const newNode = new Node(key, value);
      this.addToHead(newNode);
      this.map.set(key, newNode);
      this.size++;
    }
  }

  get(key: string): number {
    if (!this.map.has(key)) {
      return -1;
    }
    const node = this.map.get(key)!;
    this.removeNode(node);
    this.addToHead(node);
    return node.value;
  }

  remove(key: string): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      this.removeNode(node);
      this.map.delete(key);
      this.size--;
    }
  }

  getKeysInOrder(): string[] {
    const result: string[] = [];
    let current = this.head.next;
    while (current !== this.tail) {
      result.push(current.key);
      current = current.next;
    }
    return result;
  }
}

function main(): void {
  const input = fs.readFileSync(0, 'utf8').trim();
  const lines = input.split('\n');
  const [cStr, nStr] = lines[0].split(' ');
  const C: number = parseInt(cStr, 10);
  const N: number = parseInt(nStr, 10);

  const cache = new LRUCache(C);
  const getResults: number[] = [];

  for (let i = 1; i <= N; i++) {
    const parts = lines[i].split(' ');
    const op = parts[0];
    const key = parts[1];
    if (op === 'PUT') {
      const value: number = parseInt(parts[2], 10);
      cache.put(key, value);
    } else if (op === 'GET') {
      const result: number = cache.get(key);
      getResults.push(result);
    } else if (op === 'DEL') {
      cache.remove(key);
    }
  }

  if (getResults.length === 0) {
    console.log('EMPTY');
  } else {
    console.log(getResults.join(' '));
  }

  const keysInOrder = cache.getKeysInOrder();
  if (keysInOrder.length === 0) {
    console.log('EMPTY');
  } else {
    console.log(keysInOrder.join(' '));
  }
}

main();
