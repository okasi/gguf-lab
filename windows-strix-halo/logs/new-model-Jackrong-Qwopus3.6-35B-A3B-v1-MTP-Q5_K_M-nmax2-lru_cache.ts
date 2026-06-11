import * as fs from "fs";

interface Node {
  key: string;
  value: number;
  prev: Node | null;
  next: Node | null;
}

class DoubleLinkedList {
  head: Node;
  tail: Node;

  constructor() {
    this.head = { key: "", value: 0, prev: null, next: null };
    this.tail = { key: "", value: 0, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  addAtHead(node: Node): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  removeNode(node: Node): void {
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }
    node.prev = null;
    node.next = null;
  }

  removeTail(): Node | null {
    if (this.tail.prev && this.tail.prev !== this.head) {
      const node = this.tail.prev;
      this.removeNode(node);
      return node;
    }
    return null;
  }

  moveToHead(node: Node): void {
    this.removeNode(node);
    this.addAtHead(node);
  }
}

class LRUCache {
  private capacity: number;
  private cache: Map<string, Node>;
  private dll: DoubleLinkedList;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.dll = new DoubleLinkedList();
  }

  get(key: string): number {
    const node = this.cache.get(key);
    if (!node) {
      return -1;
    }
    this.dll.moveToHead(node);
    return node.value;
  }

  put(key: string, value: number): void {
    const existingNode = this.cache.get(key);
    if (existingNode) {
      existingNode.value = value;
      this.dll.moveToHead(existingNode);
      return;
    }
    const newNode: Node = { key, value, prev: null, next: null };
    this.dll.addAtHead(newNode);
    this.cache.set(key, newNode);
    if (this.cache.size > this.capacity) {
      const removedNode = this.dll.removeTail();
      if (removedNode) {
        this.cache.delete(removedNode.key);
      }
    }
  }

  delete(key: string): void {
    const node = this.cache.get(key);
    if (node) {
      this.dll.removeNode(node);
      this.cache.delete(key);
    }
  }

  getKeysMostToLeast(): string[] {
    const keys: string[] = [];
    let current = this.dll.head.next;
    while (current && current !== this.dll.tail) {
      keys.push(current.key);
      current = current.next;
    }
    return keys;
  }

  isEmpty(): boolean {
    return this.cache.size === 0;
  }
}

function main(): void {
  const input = fs.readFileSync(0, "utf8").trim();
  const lines = input.split("\n");
  const firstLine = lines[0].trim().split(/\s+/);
  const capacity = parseInt(firstLine[0], 10);
  const n = parseInt(firstLine[1], 10);

  const cache = new LRUCache(capacity);
  const getResults: number[] = [];

  for (let i = 1; i <= n; i++) {
    const line = lines[i].trim();
    const parts = line.split(/\s+/);
    const operation = parts[0];
    const key = parts[1];

    if (operation === "PUT") {
      const value = parseInt(parts[2], 10);
      cache.put(key, value);
    } else if (operation === "GET") {
      const result = cache.get(key);
      getResults.push(result);
    } else if (operation === "DEL") {
      cache.delete(key);
    }
  }

  if (getResults.length === 0) {
    console.log("EMPTY");
  } else {
    console.log(getResults.join(" "));
  }

  const keys = cache.getKeysMostToLeast();
  if (keys.length === 0) {
    console.log("EMPTY");
  } else {
    console.log(keys.join(" "));
  }
}

main();
