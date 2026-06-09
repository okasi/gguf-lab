import fs from 'fs';

interface LRUNode {
  key: string;
  value: number;
  prev: LRUNode | null;
  next: LRUNode | null;
}

class LRUCache {
  private capacity: number;
  private size: number = 0;
  private map: Map<string, LRUNode> = new Map();
  private head: LRUNode;
  private tail: LRUNode;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head = { key: "", value: 0, prev: null, next: null };
    this.tail = { key: "", value: 0, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private removeNode(node: LRUNode): void {
    const prev = node.prev!;
    const next = node.next!;
    prev.next = next;
    next.prev = prev;
  }

  private addToHead(node: LRUNode): void {
    const next = this.head.next!;
    this.head.next = node;
    node.prev = this.head;
    node.next = next;
    next.prev = node;
  }

  public get(key: string): number {
    const node = this.map.get(key);
    if (!node) return -1;
    this.removeNode(node);
    this.addToHead(node);
    return node.value;
  }

  public put(key: string, value: number): void {
    const node = this.map.get(key);
    if (node) {
      node.value = value;
      this.removeNode(node);
      this.addToHead(node);
    } else {
      if (this.size === this.capacity && this.capacity > 0) {
        const lru = this.tail.prev!;
        if (lru !== this.head) {
          this.removeNode(lru);
          this.map.delete(lru.key);
          this.size--;
        }
      }
      if (this.size < this.capacity) {
        const newNode: LRUNode = { key, value, prev: null, next: null };
        this.addToHead(newNode);
        this.map.set(key, newNode);
        this.size++;
      }
    }
  }

  public del(key: string): void {
    const node = this.map.get(key);
    if (node) {
      this.removeNode(node);
      this.map.delete(key);
      this.size--;
    }
  }

  public getKeys(): string[] {
    const keys: string[] = [];
    let curr = this.head.next;
    while (curr !== this.tail) {
      if (curr && curr !== this.head && curr !== this.tail) {
        keys.push(curr.key);
      }
      curr = curr.next!;
    }
    return keys;
  }
}

function solve() {
  const input = fs.readFileSync(0, "utf8");
  let pos = 0;

  function nextToken(): string | null {
    while (pos < input.length && input[pos] <= ' ') pos++;
    if (pos >= input.length) return null;
    let start = pos;
    while (pos < input.length && input[pos] > ' ') pos++;
    return input.slice(start, pos);
  }

  const cStr = nextToken();
  const nStr = nextToken();
  if (cStr === null || nStr === null) return;

  const C = parseInt(cStr);
  const N = parseInt(nStr);

  const cache = new LRUCache(C);
  const getResults: number[] = [];

  for (let i = 0; i < N; i++) {
    const op = nextToken();
    if (!op) break;

    if (op === 'PUT') {
      const key = nextToken();
      const valStr = nextToken();
      if (key && valStr) cache.put(key, parseInt(valStr));
    } else if (op === 'GET') {
      const key = nextToken();
      if (key) getResults.push(cache.get(key));
    } else if (op === 'DEL') {
      const key = nextToken();
      if (key) cache.del(key);
    }
  }

  process.stdout.write(getResults.length > 0 ? getResults.join(" ") + "\n" : "EMPTY\n");
  const keys = cache.getKeys();
  process.stdout.write(keys.length > 0 ? keys.join(" ") + "\n" : "EMPTY\n");
}

solve();
