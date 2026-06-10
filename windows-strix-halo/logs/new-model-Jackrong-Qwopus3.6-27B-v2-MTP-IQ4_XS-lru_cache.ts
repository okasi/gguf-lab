import fs from "fs";

class LRUCache {
  private capacity: number;
  private cacheMap: Map<string, number>;
  private keyOrder: string[];
  private keyIndex: Map<string, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cacheMap = new Map();
    this.keyOrder = [];
    this.keyIndex = new Map();
  }

  public get(key: string): number | null {
    if (!this.cacheMap.has(key)) {
      return null;
    }
    this.moveToEnd(key);
    return this.cacheMap.get(key)!;
  }

  public put(key: string, value: number): void {
    if (this.cacheMap.has(key)) {
      this.cacheMap.set(key, value);
      this.moveToEnd(key);
      return;
    }
    if (this.cacheMap.size >= this.capacity) {
      const leastRecentKey = this.keyOrder[0];
      this.keyOrder.shift();
      this.keyIndex.delete(leastRecentKey);
      this.cacheMap.delete(leastRecentKey);
    }
    this.cacheMap.set(key, value);
    this.keyOrder.push(key);
    this.keyIndex.set(key, this.keyOrder.length - 1);
  }

  public del(key: string): void {
    if (!this.cacheMap.has(key)) {
      return;
    }
    const index = this.keyIndex.get(key)!;
    this.keyOrder.splice(index, 1);
    this.keyIndex.delete(key);
    for (let i = index; i < this.keyOrder.length; i++) {
      this.keyIndex.set(this.keyOrder[i], i);
    }
    this.cacheMap.delete(key);
  }

  public getKeysMostRecentToLeastRecent(): string[] {
    return this.keyOrder.slice().reverse();
  }

  private moveToEnd(key: string): void {
    const index = this.keyIndex.get(key)!;
    if (index === this.keyOrder.length - 1) {
      return;
    }
    this.keyOrder.splice(index, 1);
    this.keyOrder.push(key);
    this.keyIndex.set(key, this.keyOrder.length - 1);
    for (let i = index; i < this.keyOrder.length - 1; i++) {
      this.keyIndex.set(this.keyOrder[i], i);
    }
  }
}

function main(): void {
  const input = fs.readFileSync(0, "utf8").trim();
  const lines = input.split("\n");
  const firstLine = lines[0].split(" ");
  const C = parseInt(firstLine[0], 10);
  const N = parseInt(firstLine[1], 10);

  const lru = new LRUCache(C);
  const getResults: number[] = [];

  for (let i = 1; i <= N; i++) {
    const parts = lines[i].split(" ");
    const op = parts[0];
    const key = parts[1];

    if (op === "GET") {
      const val = lru.get(key);
      getResults.push(val === null ? -1 : val);
    } else if (op === "PUT") {
      const value = parseInt(parts[2], 10);
      lru.put(key, value);
    } else if (op === "DEL") {
      lru.del(key);
    }
  }

  const getOutput = getResults.length > 0 ? getResults.join(" ") : "EMPTY";
  const keys = lru.getKeysMostRecentToLeastRecent();
  const keyOutput = keys.length > 0 ? keys.join(" ") : "EMPTY";

  console.log(getOutput);
  console.log(keyOutput);
}

main();
