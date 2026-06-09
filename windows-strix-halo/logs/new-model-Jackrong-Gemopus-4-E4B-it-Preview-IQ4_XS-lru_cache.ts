import * as fs from 'fs';
import { performance } from 'node:perf';

class LRUCache<K, V> implements Cache<K, V> {
  private readonly capacity: number;
  private readonly map = new Map<K, V>();
  private readonly usageOrder = new Map<K, number>();
  private readonly timestamp = Date.now();
  private lastAccess = 0;

  constructor(private readonly capacity: number) {
    this.usageOrder.set(null as K, this.timestamp);
  }

  /**
   * O(1) amortized. Moves key to most recently used position.
   */
  private access(key: K): void {
    const now = Date.now();
    this.usageOrder.set(key, now);
  }

  /**
   * O(1) amortized. Returns value or undefined.
   */
  get<V>(key: K): V | undefined {
    const value = this.map.get(key);
    if (value !== undefined) {
      this.access(key);
      return value;
    }
    return undefined;
  }

  /**
   * O(1) amortized. Puts new item or updates existing.
   */
  put<V>(key: K, value: V): void {
    this.map.set(key, value);
    this.access(key);
    if (this.map.size > this.capacity) {
      this.evict();
    }
  }

  /**
   * O(1) amortized. Removes key.
   */
  delete<K>(key: K): boolean {
    const oldValue = this.map.delete(key);
    if (oldValue !== undefined) {
      this.usageOrder.delete(key);
      return true;
    }
    return false;
  }

  /**
   * O(1) amortized. Evicts LRU item.
   */
  private evict(): void {
    const lruKey = this.usageOrder.keys().next().value;
    this.map.delete(lruKey);
    this.usageOrder.delete(lruKey);
  }

  /**
   * Returns keys in MRU to LRU order.
   */
  getKeysInOrder(): readonly K[] {
    const keys = Array.from(this.usageOrder.keys());
    return keys.reverse();
  }
}

interface Cache<K, V> {
  get<V>(key: K): V | undefined;
  put<V>(key: K, value: V): void;
  delete<K>(key: K): boolean;
  getKeysInOrder(): readonly K[];
}

function solve(): void {
  const input = fs.readFileSync(0, "utf8") as string;
  const lines = input.trim().split('\n');
  
  const [C, N] = lines[0].trim().split(/\s+/).map(Number);
  
  const getResults: number[] = [];
  const usageOrder = new LRUCache<string, number>(C);

  for (let i = 1; i <= N; i++) {
    const parts = lines[i].trim().split(/\s+/);
    const command = parts[0];
    const key = parts[1];

    switch (command)) {
      case 'PUT':
        const value = parseInt(parts[2], 10);
        usageOrder.put(key, value);
        break;
      case 'GET':
        const result = usageOrder.get(key);
        getResults.push(result === undefined ? -1 : result);
        break;
      case 'DEL':
        return usageOrder.delete(key);
        break;
    }
  }

  console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
  console.log(usageOrder.getKeysInOrder().length > 0 ? usageOrder.getKeysInOrder().join(' ') : 'EMPTY');
}

solve();
