import * as fs from "fs";

interface LRUCacheEntry {
    key: string;
    value: number;
    prev: LRUCacheEntry | null;
    next: LRUCacheEntry | null;
}

class LRUCache {
    private capacity: number;
    private map: Map<string, LRUCacheEntry>;
    private head: LRUCacheEntry | null;
    private tail: LRUCacheEntry | null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map<string, LRUCacheEntry>();
        // Dummy head and tail
        this.head = { key: "", value: 0, prev: null, next: null };
        this.tail = { key: "", value: 0, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private addToFront(entry: LRUCacheEntry): void {
        const next = this.head.next;
        entry.next = next;
        entry.prev = this.head;
        this.head.next = entry;
        next.prev = entry;
    }

    private removeEntry(entry: LRUCacheEntry): void {
        const prev = entry.prev;
        const next = entry.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
        entry.prev = null;
        entry.next = null;
    }

    private moveToHead(entry: LRUCacheEntry): void {
        this.removeEntry(entry);
        this.addToFront(entry);
    }

    private evictLeastRecentlyUsed(): void {
        if (!this.tail || !this.tail.prev || this.tail.prev === this.head) {
            return;
        }
        const lru = this.tail.prev;
        if (lru) {
            this.removeEntry(lru);
            this.map.delete(lru.key);
        }
    }

    get(key: string): number | null {
        const entry = this.map.get(key);
        if (!entry) {
            return null;
        }
        this.moveToHead(entry);
        return entry.value;
    }

    put(key: string, value: number): void {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToHead(existing);
        } else {
            if (this.map.size >= this.capacity) {
                this.evictLeastRecentlyUsed();
            }
            const newEntry: LRUCacheEntry = {
                key,
                value,
                prev: null,
                next: null
            };
            this.map.set(key, newEntry);
            this.addToFront(newEntry);
        }
    }

    del(key: string): boolean {
        const entry = this.map.get(key);
        if (!entry) {
            return false;
        }
        this.removeEntry(entry);
        this.map.delete(key);
        return true;
    }

    getKeysMostRecentToLeast(): string[] {
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
    if (!input) {
        return;
    }

    const lines = input.split("\n");
    const firstLine = lines[0].trim().split(/\s+/);
    const capacity = parseInt(firstLine[0], 10);
    const numOps = parseInt(firstLine[1], 10);

    const cache = new LRUCache(capacity);
    const getResults: string[] = [];

    for (let i = 1; i <= numOps && i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        const command = parts[0].toUpperCase();

        if (command === "PUT") {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (command === "GET") {
            const key = parts[1];
            const result = cache.get(key);
            if (result === null) {
                getResults.push("-1");
            } else {
                getResults.push(result.toString());
            }
        } else if (command === "DEL") {
            const key = parts[1];
            cache.del(key);
        }
    }

    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(" "));
    }

    const remainingKeys = cache.getKeysMostRecentToLeast();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(remainingKeys.join(" "));
    }
}

main();
