const fs = require("fs");

class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.size = 0;
    this.map = new Map();
    this.head = new Node(null, null);
    this.tail = new Node(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    const prev = node.prev;
    const next = node.next;
    prev.next = next;
    next.prev = prev;
    this.size--;
  }

  _add(node) {
    const next = this.head.next;
    this.head.next = node;
    node.prev = this.head;
    node.next = next;
    next.prev = node;
    this.size++;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const existing = this.map.get(key);
      this._remove(existing);
      existing.value = value;
      this._add(existing);
      return;
    }
    if (this.size >= this.capacity) {
      const lru = this.tail.prev;
      this.map.delete(lru.key);
      this._remove(lru);
    }
    const node = new Node(key, value);
    this.map.set(key, node);
    this._add(node);
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._add(node);
    return node.value;
  }

  del(key) {
    if (!this.map.has(key)) return;
    const node = this.map.get(key);
    this._remove(node);
    this.map.delete(key);
  }

  getKeys() {
    const result = [];
    let current = this.head.next;
    while (current !== this.tail) {
      result.push(current.key);
      current = current.next;
    }
    return result;
  }
}

const input = fs.readFileSync(0, "utf8").trim().split("\n");
if (!input[0]) process.exit();

const [C, N] = input[0].split(" ").map(Number);
const cache = new LRUCache(C);

const getResults = [];

for (let i = 1; i <= N; i++) {
  const parts = input[i].trim().split(" ");
  const op = parts[0];
  const key = parts[1];
  const value = parts[2];

  if (op === "PUT") {
    cache.put(key, Number(value));
  } else if (op === "GET") {
    getResults.push(cache.get(key));
  } else if (op === "DEL") {
    cache.del(key);
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
