import * as fs from "fs";

const raw = fs.readFileSync(0, "utf8").trim();
if (!raw) process.exit(0);
const data = raw.split(/\s+/);
const C = Number(data[0]);
const N = Number(data[1]);
let idx = 2;

class Node {
  key: string;
  val: number;
  prev: Node | null;
  next: Node | null;
  constructor(key: string, val: number) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  capacity: number;
  map: Map<string, Node>;
  head: Node;
  tail: Node;
  size: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node("", 0);
    this.tail = new Node("", 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }

  private addToHead(node: Node) {
    node.prev = this.head;
    node.next = this.head.next!;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: Node) {
    node.prev!.next = node.next!;
    node.next!.prev = node.prev!;
  }

  private moveToHead(node: Node) {
    this.removeNode(node);
    this.addToHead(node);
  }

  private popTail(): Node | null {
    if (this.tail.prev === this.head) return null;
    const node = this.tail.prev!;
    this.removeNode(node);
    return node;
  }

  put(key: string, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.val = value;
      this.moveToHead(node);
    } else {
      const node = new Node(key, value);
      this.map.set(key, node);
      this.addToHead(node);
      this.size++;
      if (this.size > this.capacity) {
        const tail = this.popTail()!;
        this.map.delete(tail.key);
        this.size--;
      }
    }
  }

  get(key: string): number {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key)!;
    this.moveToHead(node);
    return node.val;
  }

  del(key: string): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      this.removeNode(node);
      this.map.delete(key);
      this.size--;
    }
  }

  getOrderedKeys(): string[] {
    const keys: string[] = [];
    let curr = this.head.next;
    while (curr && curr !== this.tail) {
      keys.push(curr.key);
      curr = curr.next;
    }
    return keys;
  }
}

const cache = new LRUCache(C);
const getResults: number[] = [];

for (let i = 0; i < N; i++) {
  const op = data[idx++];
  if (op === "PUT") {
    const key = data[idx++];
    const val = Number(data[idx++]);
    cache.put(key, val);
  } else if (op === "GET") {
    const key = data[idx++];
    getResults.push(cache.get(key));
  } else if (op === "DEL") {
    const key = data[idx++];
    cache.del(key);
  }
}

const output: string[] = [];
output.push(getResults.length > 0 ? getResults.join(" ") : "EMPTY");
output.push(cache.getOrderedKeys().length > 0 ? cache.getOrderedKeys().join(" ") : "EMPTY");
console.log(output.join("\n"));
