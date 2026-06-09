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
  private head: Node;
  private tail: Node;
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node("", 0);
    this.tail = new Node("", 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  
  private removeNode(node: Node): void {
    const prev = node.prev;
    const next = node.next;
    if (prev && next) {
      prev.next = next;
      next.prev = prev;
    }
  }
  
  private addToHead(node: Node): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }
  
  private removeTail(): Node | null {
    const node = this.tail.prev;
    if (node) {
      this.removeNode(node);
    }
    return node;
  }
  
  get(key: string): number {
    const node = this.map.get(key);
    if (!node) {
      return -1;
    }
    this.removeNode(node);
    this.addToHead(node);
    return node.value;
  }
  
  put(key: string, value: number): void {
    const node = this.map.get(key);
    if (node) {
      node.value = value;
      this.removeNode(node);
      this.addToHead(node);
    } else {
      const newNode = new Node(key, value);
      this.map.set(key, newNode);
      this.addToHead(newNode);
      if (this.map.size > this.capacity) {
        const tail = this.removeTail();
        if (tail) {
          this.map.delete(tail.key);
        }
      }
    }
  }
  
  del(key: string): void {
    const node = this.map.get(key);
    if (node) {
      this.removeNode(node);
      this.map.delete(key);
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

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split("\n");
const [C, N] = lines[0].split(" ").map(Number);
const cache = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
  const parts = lines[i].split(" ");
  const operation = parts[0];
  const key = parts[1];
  
  if (operation === "GET") {
    const value = cache.get(key);
    getResults.push(value);
  } else if (operation === "PUT") {
    const value = parseInt(parts[2], 10);
    cache.put(key, value);
  } else if (operation === "DEL") {
    cache.del(key);
  }
}

const getOutput = getResults.length > 0 ? getResults.join(" ") : "EMPTY";
const keys = cache.getKeys();
const keysOutput = keys.length > 0 ? keys.join(" ") : "EMPTY";

console.log(getOutput);
console.log(keysOutput);
