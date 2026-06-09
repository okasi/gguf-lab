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

class DoublyLinkedList {
  head: Node;
  tail: Node;

  constructor() {
    this.head = new Node("", 0);
    this.tail = new Node("", 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  addFirst(node: Node): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next = node;
    node.next.prev = node;
  }

  remove(node: Node): void {
    const prevNode = node.prev;
    const nextNode = node.next;
    prevNode.next = nextNode;
    nextNode.prev = prevNode;
  }

  removeLast(): Node | null {
    if (this.tail.prev === this.head) {
      return null;
    }
    const lastNode = this.tail.prev;
    this.remove(lastNode);
    return lastNode;
  }

  moveToFront(node: Node): void {
    this.remove(node);
    this.addFirst(node);
  }
}

class LRUCache {
  capacity: number;
  map: Map<string, Node>;
  list: DoublyLinkedList;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.list = new DoublyLinkedList();
  }

  get(key: string): number {
    if (!this.map.has(key)) {
      return -1;
    }
    const node = this.map.get(key);
    this.list.moveToFront(node);
    return node.value;
  }

  put(key: string, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      this.list.moveToFront(node);
    } else {
      if (this.map.size === this.capacity) {
        const lastNode = this.list.removeLast();
        if (lastNode) {
          this.map.delete(lastNode.key);
        }
      }
      const newNode = new Node(key, value);
      this.list.addFirst(newNode);
      this.map.set(key, newNode);
    }
  }

  del(key: string): void {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      this.list.remove(node);
      this.map.delete(key);
    }
  }

  getKeysInOrder(): string[] {
    const keys: string[] = [];
    let current = this.list.head.next;
    while (current !== this.list.tail) {
      keys.push(current.key);
      current = current.next;
    }
    return keys;
  }
}

function main(): void {
  const input = fs.readFileSync(0, "utf8").trim();
  const lines = input.split("\n");
  const firstLine = lines[0].split(" ");
  const capacity = parseInt(firstLine[0]);
  const n = parseInt(firstLine[1]);

  const cache = new LRUCache(capacity);
  const getResults: string[] = [];

  for (let i = 1; i <= n; i++) {
    const parts = lines[i].split(" ");
    const operation = parts[0];
    const key = parts[1];

    if (operation === "PUT") {
      const value = parseInt(parts[2]);
      cache.put(key, value);
    } else if (operation === "GET") {
      const result = cache.get(key);
      getResults.push(result.toString());
    } else if (operation === "DEL") {
      cache.del(key);
    }
  }

  const getOutput = getResults.length > 0 ? getResults.join(" ") : "EMPTY";
  const keysInOrder = cache.getKeysInOrder();
  const keysOutput = keysInOrder.length > 0 ? keysInOrder.join(" ") : "EMPTY";

  console.log(getOutput);
  console.log(keysOutput);
}

main();
