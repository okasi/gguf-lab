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
  private map: Map<string, Node>;
  private head: Node | null;
  private tail: Node | null;
  private size: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  private addToHead(node: Node): void {
    node.next = this.head;
    node.prev = null;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: Node): void {
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
    node.prev = null;
    node.next = null;
  }

  private moveToHead(node: Node): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): Node | null {
    if (!this.tail) {
      return null;
    }
    const removedNode = this.tail;
    this.tail = this.tail.prev;
    if (this.tail) {
      this.tail.next = null;
    } else {
      this.head = null;
    }
    return removedNode;
  }

  get(key: string): number {
    if (!this.map.has(key)) {
      return -1;
    }
    const node = this.map.get(key)!;
    this.moveToHead(node);
    return node.value;
  }

  put(key: string, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this.moveToHead(node);
    } else {
      const newNode = new Node(key, value);
      this.map.set(key, newNode);
      this.addToHead(newNode);
      this.size++;
      if (this.size > this.capacity) {
        const removedNode = this.removeTail();
        if (removedNode) {
          this.map.delete(removedNode.key);
          this.size--;
        }
      }
    }
  }

  delete(key: string): void {
    if (!this.map.has(key)) {
      return;
    }
    const node = this.map.get(key)!;
    this.removeNode(node);
    this.map.delete(key);
    this.size--;
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

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split("\n");
const firstLine = lines[0].split(" ");
const capacity = parseInt(firstLine[0], 10);
const numOperations = parseInt(firstLine[1], 10);

const cache = new LRUCache(capacity);
const getResults: number[] = [];

for (let i = 1; i <= numOperations; i++) {
  const parts = lines[i].split(" ");
  const operation = parts[0];
  if (operation === "GET") {
    const key = parts[1];
    const result = cache.get(key);
    getResults.push(result);
  } else if (operation === "PUT") {
    const key = parts[1];
    const value = parseInt(parts[2], 10);
    cache.put(key, value);
  } else if (operation === "DEL") {
    const key = parts[1];
    cache.delete(key);
  }
}

if (getResults.length === 0) {
  console.log("EMPTY");
} else {
  console.log(getResults.join(" "));
}

const keys = cache.getKeys();
if (keys.length === 0) {
  console.log("EMPTY");
} else {
  console.log(keys.join(" "));
}
