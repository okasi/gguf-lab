import * as fs from "fs";

const input = fs.readFileSync(0, "utf8");
const lines = input.trim().split("\n");
const [C, N] = lines[0].split(" ").map(Number);

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

class DoublyLinkedList {
  head: Node;
  tail: Node;

  constructor() {
    this.head = new Node("", -1);
    this.tail = new Node("", -1);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  addToFront(node: Node): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  remove(node: Node): void {
    const prev = node.prev;
    const next = node.next;
    if (prev && next) {
      prev.next = next;
      next!.prev = prev;
    }
    node.prev = null;
    node.next = null;
  }

  removeLast(): Node | null {
    if (this.tail.prev === this.head) {
      return null;
    }
    const last = this.tail.prev;
    this.remove(last);
    return last;
  }

  moveToFront(node: Node): void {
    this.remove(node);
    this.addToFront(node);
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

const cache = new Map<string, Node>();
const list = new DoublyLinkedList();
let capacity = C;
let size = 0;
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
  const parts = lines[i].split(" ");
  const operation = parts[0];
  const key = parts[1];
  const value = parts.length > 2 ? Number(parts[2]) : 0;

  if (operation === "GET") {
    if (cache.has(key)) {
      const node = cache.get(key)!;
      node.value = value;
      list.moveToFront(node);
      getResults.push(value);
    } else {
      getResults.push(-1);
    }
  } else if (operation === "PUT") {
    if (cache.has(key)) {
      const node = cache.get(key)!;
      node.value = value;
      list.moveToFront(node);
    } else {
      if (size === capacity) {
        const lru = list.removeLast();
        if (lru) {
          cache.delete(lru.key);
          size--;
        }
      }
      const newNode = new Node(key, value);
      list.addToFront(newNode);
      cache.set(key, newNode);
      size++;
    }
  } else if (operation === "DEL") {
    if (cache.has(key)) {
      const node = cache.get(key)!;
      list.remove(node);
      cache.delete(key);
      size--;
    }
  }
}

const output1 = getResults.length > 0 ? getResults.join(" ") : "EMPTY";
const output2 = list.getKeys().length > 0 ? list.getKeys().join(" ") : "EMPTY";

console.log(output1);
console.log(output2);
