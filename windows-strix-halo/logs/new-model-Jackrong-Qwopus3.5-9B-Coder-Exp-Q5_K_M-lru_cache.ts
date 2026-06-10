import * as fs from "fs";

class Node {
  key: string;
  value: number;
  next: Node | null;
  prev: Node | null;

  constructor(key: string, value: number) {
    this.key = key;
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}

class LRUCache {
  capacity: number;
  map: Map<string, Node>;
  head: Node;
  tail: Node;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node("HEAD", 0);
    this.tail = new Node("TAIL", 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  addToHead(node: Node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  removeNode(node: Node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  moveToHead(node: Node) {
    this.removeNode(node);
    this.addToHead(node);
  }

  put(key: string, value: number) {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this.moveToHead(node);
    } else {
      const node = new Node(key, value);
      this.addToHead(node);
      this.map.set(key, node);
      if (this.map.size > this.capacity) {
        const tail = this.tail.prev;
        this.removeNode(tail);
        this.map.delete(tail.key);
      }
    }
  }

  get(key: string): number {
    if (!this.map.has(key)) {
      return -1;
    }
    const node = this.map.get(key)!;
    this.moveToHead(node);
    return node.value;
  }

  delete(key: string) {
    if (!this.map.has(key)) {
      return;
    }
    const node = this.map.get(key)!;
    this.removeNode(node);
    this.map.delete(key);
  }

  toArray(): string[] {
    const keys: string[] = [];
    let current = this.head.next;
    while (current !== this.tail) {
      keys.push(current.key);
      current = current.next;
    }
    return keys;
  }
}

const input = fs.readFileSync(0, "utf8").trim().split("\n");
if (input.length === 0) {
  console.log("EMPTY");
  console.log("EMPTY");
  return;
}

const [C, N] = input[0].split(/\s+/).map(Number);
const cache = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
  const parts = input[i].split(/\s+/);
  const op = parts[0];
  const key = parts[1];
  const value = parts.length > 2 ? parseInt(parts[2]) : undefined;

  if (op === "PUT") {
    cache.put(key, value as number);
  } else if (op === "GET") {
    getResults.push(cache.get(key));
  } else if (op === "DEL") {
    cache.delete(key);
  }
}

if (getResults.length === 0) {
  console.log("EMPTY");
} else
