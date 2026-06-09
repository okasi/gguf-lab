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

  private addToFront(node: Node): void {
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

  private removeLast(): Node {
    const last = this.tail.prev!;
    this.removeNode(last);
    return last;
  }

  put(key: string, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      this.removeNode(node);
      node.value = value;
      this.addToFront(node);
      return;
    }
    if (this.map.size >= this.capacity) {
      const lastNode = this.removeLast();
      this.map.delete(lastNode.key);
    }
    const node = new Node(key, value);
    this.map.set(key, node);
    this.addToFront(node);
  }

  get(key: string): number {
    if (!this.map.has(key)) {
      return -1;
    }
    const node = this.map.get(key)!;
    this.removeNode(node);
    this.addToFront(node);
    return node.value;
  }

  del(key: string): void {
    if (!this.map.has(key)) {
      return;
    }
    const node = this.map.get(key)!;
    this.removeNode(node);
    this.map.delete(key);
  }

  getKeysInOrder(): string[] {
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
  const [capacityStr, nStr] = lines[0].split(" ");
  const capacity = parseInt(capacityStr, 10);
  const n = parseInt(nStr, 10);

  const cache = new LRUCache(capacity);
  const getResults: string[] = [];

  for (let i = 1; i <= n; i++) {
    const parts = lines[i].split(" ");
    const operation = parts[0];
    const key = parts[1];
    const value = parts[2] ? parseInt(parts[2], 10) : undefined;

    switch (operation) {
      case "PUT":
        cache.put(key, value!);
        break;
      case "GET":
        const result = cache.get(key);
        getResults.push(result.toString());
        break;
      case "DEL":
        cache.del(key);
        break;
    }
  }

  const getOutput = getResults.length === 0 ? "EMPTY" : getResults.join(" ");
  const keysInOrder = cache.getKeysInOrder();
  const keysOutput = keysInOrder.length === 0 ? "EMPTY" : keysInOrder.join(" ");

  console.log(getOutput);
  console.log(keysOutput);
}

main();
