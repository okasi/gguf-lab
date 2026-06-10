import * as fs from 'fs';

class LRUCache {
  private capacity: number;
  private cache: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  public get(key: number): number {
    if (!this.cache.has(key)) {
      return -1;
    }

    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  public put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  public del(key: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
  }

  public keys(): number[] {
    return Array.from(this.cache.keys());
  }
}

const input = fs.readFileSync(0, 'utf8').trim().split('\n');
const [capacity, operations] = input.shift()!.split(' ').map(Number);
const cache = new LRUCache(capacity);
const getResults: number[] = [];

for (const line of input) {
  const [operation, key, value] = line.split(' ');

  if (operation === 'GET') {
    getResults.push(cache.get(Number(key)));
  } else if (operation === 'PUT') {
    cache.put(Number(key), Number(value));
  } else if (operation === 'DEL') {
    cache.del(Number(key));
  }
}

if (getResults.length > 0) {
  console.log(getResults.join(' '));
} else {
  console.log('EMPTY');
}

const keys = cache.keys();
if (keys.length > 0) {
  console.log(keys.join(' '));
} else {
  console.log('EMPTY');
}
