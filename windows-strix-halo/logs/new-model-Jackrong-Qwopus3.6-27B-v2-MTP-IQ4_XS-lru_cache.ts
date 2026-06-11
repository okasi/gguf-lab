import fs from "fs";

class LRUCache {
  private capacity: number;
  private size: number;
  private prev: Map<string, string | null>;
  private next: Map<string, string | null>;
  private val: Map<string, number>;
  private head: string | null;
  private tail: string | null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.size = 0;
    this.prev = new Map();
    this.next = new Map();
    this.val = new Map();
    this.head = null;
    this.tail = null;
  }

  private remove(key: string): void {
    const p = this.prev.get(key) ?? null;
    const n = this.next.get(key) ?? null;
    if (p !== null) {
      this.next.set(p, n);
    } else {
      this.head = n;
    }
    if (n !== null) {
      this.prev.set(n, p);
    } else {
      this.tail = p;
    }
    this.prev.delete(key);
    this.next.delete(key);
  }

  private pushFront(key: string): void {
    this.prev.set(key, null);
    if (this.head !== null) {
      this.next.set(key, this.head);
      this.prev.set(this.head, key);
    } else {
      this.next.set(key, null);
      this.tail = key;
    }
    this.head = key;
  }

  get(key: string): number {
    if (!this.val.has(key)) return -1;
    this.moveToFront(key);
    return this.val.get(key)!;
  }

  put(key: string, value: number): void {
    if (this.val.has(key)) {
      this.val.set(key, value);
      this.moveToFront(key);
    } else {
      if (this.size === this.capacity) {
        this.evict();
      }
      this.val.set(key, value);
      this.pushFront(key);
      this.size++;
    }
  }

  del(key: string): void {
    if (!this.val.has(key)) return;
    this.remove(key);
    this.val.delete(key);
    this.size--;
  }

  keysMRUToLRU(): string[] {
    const result: string[] = [];
    let cur: string | null = this.head;
    while (cur !== null) {
      result.push(cur);
      cur = this.next.get(cur) ?? null;
    }
    return result;
  }

  private moveToFront(key: string): void {
    if (this.head === key) return;
    this.remove(key);
    this.pushFront(key);
  }

  private evict(): void {
    const t = this.tail!;
    this.remove(t);
    this.val.delete(t);
  }
}

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split("\n");
const [C, N] = lines[0].split(" ").map(Number);

const cache = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
  const parts = lines[i].split(" ");
  const op = parts[0];
  const key = parts[1];
  if (op === "GET") {
    getResults.push(cache.get(key));
  } else if (op === "PUT") {
    const value = parseInt(parts[2], 10);
    cache.put(key, value);
  } else if (op === "DEL") {
    cache.del(key);
  }
}

const getLine = getResults.length > 0 ? getResults.join(" ") : "EMPTY";
const keys = cache.keysMRUToLRU();
const keysLine = keys.length > 0 ? keys.join(" ") : "EMPTY";

console.log(getLine);
console.log(keysLine);
