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
  private size: number;
  private cache: Map<string, Node>;
  private head: Node; // dummy node
  private tail: Node; // dummy node

  constructor(capacity: number) {
    this.capacity = capacity;
    this.size = 0;
    this.cache = new Map();
    this.head = new Node("", 0);
    this.tail = new Node("", 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private addToHead(node: Node): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: Node): void {
    const prev = node.prev;
    const next = node.next;
    if (prev && next) {
      prev.next = next;
      next!.prev = prev;
    }
  }

  private moveToHead(node: Node): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): Node | null {
    const node = this.tail.prev;
    if (node && node !== this.head) {
      this.removeNode(node);
      return node;
    }
    return null;
  }

  get(key: string): number {
    const node = this.cache.get(key);
    if (!node) {
      return -1;
    }
    this.moveToHead(node);
    return node.value;
  }

  put(key: string, value: number): void {
    const node = this.cache.get(key);
    if (node) {
      node.value = value;
      this.moveToHead(node);
    } else {
      const newNode = new Node(key, value);
      this.cache.set(key, newNode);
      this.addToHead(newNode);
      this.size++;
      if (this.size > this.capacity) {
        const tail = this.removeTail();
        if (tail) {
          this.cache.delete(tail.key);
          this.size--;
        }
      }
    }
  }

  delete(key: string): void {
    const node = this.cache.get(key);
    if (node) {
      this.removeNode(node);
      this.cache.delete(key);
      this.size--;
    }
  }

  getKeys(): string[] {
    const keys: string[] = [];
    let current = this.head.next;
    while (current && current !== this.tail) {
      keys.push(current.key);
      current = current.next;
    }
    return keys;
  }
}

const input = fs.readFileSync(0, "utf8");
const lines = input.trim().split("\n");
const firstLine = lines[0].split(" ");
const capacity = parseInt(firstLine[0]);
const n = parseInt(firstLine[1]);

const cache = new LRUCache(capacity);
const getResults: string[] = [];

for (let i = 1; i <= n; i++) {
  const line = lines[i].trim();
  const parts = line.split(" ");
  const op = parts[0];
  const key = parts[1];

  if (op === "PUT") {
    const value = parseInt(parts[2]);
    cache.put(key, value);
  } else if (op === "GET") {
    const result = cache.get(key);
    getResults.push(result.toString());
  } else if (op === "DEL") {
    cache.delete(key);
  }
}

if (getResults.length > 0) {
  console.log(getResults.join(" "));
} else {
  console.log("EMPTY");
}

const remainingKeys = cache.getKeys();
if (remainingKeys.length > 0) {
  console.log(remainingKeys.join(" "));
} else {
  console.log("EMPTY");
}
