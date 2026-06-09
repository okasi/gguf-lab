import * as fs from "fs";

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
  private count: number;
  private cache: Map<string, Node>;
  private head: Node;
  private tail: Node;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.count = 0;
    this.cache = new Map<string, Node>();
    this.head = new Node("", 0);
    this.tail = new Node("", 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private addToHead(node: Node): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: Node): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToHead(node: Node): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): Node | null {
    if (this.tail.prev === this.head) return null;
    const node = this.tail.prev;
    this.removeNode(node);
    return node;
  }

  put(key: string, value: number): void {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      node.value = value;
      this.moveToHead(node);
    } else {
      if (this.count === this.capacity) {
        const tailNode = this.removeTail();
        if (tailNode) {
          this.cache.delete(tailNode.key);
          this.count--;
        }
      }
      const newNode = new Node(key, value);
      this.addToHead(newNode);
      this.cache.set(key, newNode);
      this.count++;
    }
  }

  get(key: string): number {
    if (!this.cache.has(key)) return -1;
    const node = this.cache.get(key)!;
    this.moveToHead(node);
    return node.value;
  }

  del(key: string): void {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      this.removeNode(node);
      this.cache.delete(key);
      this.count--;
    }
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

function main(): void {
  const input = fs.readFileSync(0, "utf8").trim();
  if (!input) return;

  const lines = input.split("\n");
  const [c, n] = lines[0].split(/\s+/).map(Number);

  const lru = new LRUCache(c);
  const getResults: number[] = [];

  for (let i = 1; i <= n; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(/\s+/);
    const op = parts[0];
    const key = parts[1];

    if (op === "PUT") {
      const value = parseInt(parts[2], 10);
      lru.put(key, value);
    } else if (op === "GET") {
      const result = lru.get(key);
      getResults.push(result);
    } else if (op === "DEL") {
      lru.del(key);
    }
  }

  if (getResults.length === 0) {
    console.log("EMPTY");
  } else {
    console.log(getResults.join(" "));
  }

  const keys = lru.getKeys();
  if (keys.length === 0) {
    console.log("EMPTY");
  } else {
    console.log(keys.join(" "));
  }
}

main();
