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
  private map: Map<string, Node>;
  private head: Node;
  private tail: Node;
  private capacity: number;
  private size: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.size = 0;
    this.map = new Map();
    // Dummy nodes for easier manipulation
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

  private removeTail(): void {
    const toRemove = this.tail.prev;
    if (toRemove) {
      this.removeNode(toRemove);
      this.map.delete(toRemove.key);
      this.size--;
    }
  }

  put(key: string, value: number): void {
    if (this.map.has(key)) {
      const existing = this.map.get(key);
      if (existing) {
        existing.value = value;
        this.moveToHead(existing);
      }
    } else {
      const newNode = new Node(key, value);
      this.map.set(key, newNode);
      this.addToHead(newNode);
      this.size++;
      if (this.size > this.capacity) {
        this.removeTail();
      }
    }
  }

  get(key: string): number {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      if (node) {
        this.moveToHead(node);
        return node.value;
      }
    }
    return -1;
  }

  delete(key: string): void {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      if (node) {
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
      }
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

function main(): void {
  const input = fs.readFileSync(0, "utf8").trim();
  const lines = input.split("\n");
  const [C, N] = lines[0].split(" ").map(Number);
  const cache = new LRUCache(C);
  const getResults: number[] = [];

  for (let i = 1; i <= N; i++) {
    const line = lines[i].trim();
    if (line.startsWith("PUT")) {
      const parts = line.split(" ");
      const key = parts[1];
      const value = parseInt(parts[2], 10);
      cache.put(key, value);
    } else if (line.startsWith("GET")) {
      const parts = line.split(" ");
      const key = parts[1];
      const result = cache.get(key);
      getResults.push(result);
    } else if (line.startsWith("DEL")) {
      const parts = line.split(" ");
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
}

main();
