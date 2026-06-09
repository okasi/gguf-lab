import fs from 'fs';

class Node {
  public key: string;
  public value: number;
  public prev: Node | null;
  public next: Node | null;

  constructor(key: string, value: number) {
    this.key = key;
    this.value = value;
  }
}

class LRUCache {
  private capacity: number;
  private map: Map<string, Node>;
  private head: Node;
  private tail: Node;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map<string, Node>();
    this.head = new Node(null, null);
    this.tail = new Node(null, null);
    this.head.prev = this.tail;
    this.tail.next = this.head;
  }

  private addToHead(node: Node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  private removeNode(node: Node) {
    const prev = node.prev;
    const next = node.next;
    prev.next = next;
    next.prev = prev;
  }

  get(key: string): number | -1 {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key)!;
    this.removeNode(node);
    this.addToHead(node);
    return node.value;
  }

  put(key: string, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this.removeNode(node);
      this.addToHead(node);
      return;
    }
    const newNode = new Node(key, value);
    this.map.set(key, newNode);
    this.addToHead(newNode);
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this.removeNode(lru);
      this.map.delete(lru.key);
    }
  }

  del(key: string): void {
    if (!this.map.has(key)) return;
    const node = this.map.get(key)!;
    this.removeNode(node);
    this.map.delete(key);
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

function main() {
  const data = fs.readFileSync(0, "utf8").trim().split('\n');
  if (data.length < 2) return;
  const [C, N] = data[0].split(/\s+/);
  const cache = new LRUCache(Number(C));
  const results: string[] = [];

  for (let i = 1; i <= N; ++i) {
    const line = data[i];
    if (!line.trim()) continue;
    const parts = line.split(' ');
    const op = parts[0];
    switch (op) {
      case 'GET':
        results.push(cache.get(parts[1]));
        break;
      case 'PUT':
        cache.put(parts[1], Number(parts[2]));
        break;
      case 'DEL':
        cache.del(parts[1]);
        break;
    }
  }

  const output: string[] = [];
  if (results.length > 0) {
    output.push(results.join(''));
  } else {
    output.push('EMPTY');
  }

  const remainingKeys = cache.getKeys();
  if (remainingKeys.length === 0) {
    output.push('EMPTY');
  } else {
    output.push(remainingKeys.join(''));
  }

  console.log(output.join('\n'));
}

if (require.main === module) {
  main();
}
