const fs = require('fs');
class Node {
  constructor(public key: string, public value: number) {}
}
class LRUCache {
  private capacity: number;
  private map: Map<string, Node>;
  private head: Node | null;
  private tail: Node | null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = null;
    this.tail = null;
  }

  set(key: string, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this.moveToHead(node);
      return;
    }
    const newNode = new Node(key, value);
    this.map.set(key, newNode);
    this.addToHead(newNode);
    if (this.map.size > this.capacity) {
      this.removeTail();
    }
  }

  get(key: string): number | -1 {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key)!;
    this.moveToHead(node);
    return node.value;
  }

  del(key: string): void {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      this.removeNode(node);
      this.map.delete(key);
    }
  }

  private addToHead(node: Node): void {
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
  }

  private removeNode(node: Node): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private moveToHead(node: Node): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): void {
    if (!this.tail) return;
    const toDelete = this.tail;
    this.removeNode(toDelete);
    this.map.delete(toDelete.key);
    if (this.tail) this.tail = this.tail.prev;
    else {
      this.head = null;
      this.tail = null;
    }
  }
}
const fs = require('fs');
const data = fs.readFileSync(0, 'utf8');
const lines = data.trim().split('\n');
if (lines.length < 1) {
  console.log('EMPTY');
  console.log('EMPTY');
  process.exit(0);
}
const C = Number(lines[0].trim());
const N = Number(lines[1].trim());
const cache = new LRUCache(C);
let getResults: string[] = [];

for (let i = 2; i < lines.length; ++i) {
  const line = lines[i].trim();
  if (!line) continue;
  const parts = line.split(' ');
  if (parts[0] === 'PUT') {
    const key = parts[1];
    const value = Number(parts.slice(2).join(''));
    cache.set(key, value);
  } else if (parts[0] === 'GET') {
    const result = cache.get(parts[1]);
    getResults.push(result.toString());
  } else if (parts[0] === 'DEL') {
    cache.del(parts[1]);
  }
}

if (getResults.length > 0) console.log(getResults.join(' '));
else console.log('EMPTY');

const remainingKeys: string[] = [];
if (cache.head) {
  let curr = cache.head;
  while (curr) {
    remainingKeys.push(curr.key);
    curr = curr.next;
  }
}
if (remainingKeys.length > 0) console.log(remainingKeys.join(' '));
else console.log('EMPTY');
