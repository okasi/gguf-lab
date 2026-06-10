import fs from "fs";

interface LRUCacheNode {
    key: string;
    value: number;
    prev: LRUCacheNode | null;
    next: LRUCacheNode | null;
}

function createNode(key: string, value: number): LRUCacheNode {
    return { key, value, prev: null, next: null };
}

class LRUCache {
    private capacity: number;
    private map: Map<string, LRUCacheNode>;
    private head: LRUCacheNode;
    private tail: LRUCacheNode;
    private size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = createNode("", 0);
        this.tail = createNode("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    private removeFromList(node: LRUCacheNode): void {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private addToFront(node: LRUCacheNode): void {
        const oldFirst = this.head.next!;
        this.head.next = node;
        node.prev = this.head;
        node.next = oldFirst;
        oldFirst.prev = node;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToFront(existing);
            return;
        }
        if (this.size >= this.capacity) {
            this.evictLRU();
        }
        const node = createNode(key, value);
        this.map.set(key, node);
        this.addToFront(node);
        this.size++;
    }

    delete(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.removeFromList(node);
            this.map.delete(key);
            this.size--;
        }
    }

    private moveToFront(node: LRUCacheNode): void {
        this.removeFromList(node);
        this.addToFront(node);
    }

    private evictLRU(): void {
        const lru = this.tail.prev!;
        if (lru === this.head) {
            return;
        }
        this.removeFromList(lru);
        this.map.delete(lru.key);
        this.size--;
    }

    getKeys(): string[] {
        const result: string[] = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) {
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }

    const lines = input.split("\n");
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N && i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        const op = parts[0].toUpperCase();

        if (op === "PUT" && parts.length >= 3) {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (op === "GET" && parts.length >= 2) {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        } else if (op === "DEL" && parts.length >= 2) {
            const key = parts[1];
            cache.delete(key);
        }
    }

    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(" "));
    }

    const remainingKeys = cache.getKeys();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(remainingKeys.join(" "));
    }
}

main();
