import * as fs from "fs";

class LRUCache {
    private capacity: number;
    private head: number;
    private tail: number;
    private next: number[];
    private prev: number[];
    private keyToIndex: Map<string, number>;
    private indexToKey: string[];
    private indexToValue: number[];
    private count: number;
    private freeList: number[];

    constructor(capacity: number) {
        this.capacity = capacity;
        this.head = -1; // Points to the most recently used node
        this.tail = -1; // Points to the least recently used node
        this.count = 0;
        
        // Pre-allocate arrays for performance. Max capacity is 200000.
        const maxSize = 200000;
        this.next = new Array(maxSize).fill(-1);
        this.prev = new Array(maxSize).fill(-1);
        this.indexToKey = new Array(maxSize);
        this.indexToValue = new Array(maxSize);
        
        // Hash map to quickly find the index of a key
        this.keyToIndex = new Map();
        
        // Free list to reuse indices
        this.freeList = [];
        for (let i = 0; i < maxSize; i++) {
            this.freeList.push(i);
        }
    }

    private allocate(): number {
        if (this.freeList.length === 0) {
            // Should not happen given constraints, but fallback
            return this.indexToKey.length;
        }
        return this.freeList.pop()!;
    }

    private free(index: number): void {
        this.next[index] = -1;
        this.prev[index] = -1;
        this.indexToKey[index] = undefined!;
        this.indexToValue[index] = 0;
        this.freeList.push(index);
    }

    private removeNode(index: number): void {
        const prevIdx = this.prev[index];
        const nextIdx = this.next[index];

        if (prevIdx !== -1) {
            this.next[prevIdx] = nextIdx;
        } else {
            // This node is the head
            this.head = nextIdx;
        }

        if (nextIdx !== -1) {
            this.prev[nextIdx] = prevIdx;
        } else {
            // This node is the tail
            this.tail = prevIdx;
        }

        this.count--;
    }

    private addToHead(index: number): void {
        this.next[index] = this.head;
        this.prev[index] = -1;

        if (this.head !== -1) {
            this.prev[this.head] = index;
        }

        this.head = index;

        if (this.tail === -1) {
            this.tail = index;
        }

        this.count++;
    }

    moveToHead(index: number): void {
        if (this.head === index) {
            return; // Already most recently used
        }

        this.removeNode(index);
        this.addToHead(index);
    }

    get(key: string): number {
        const index = this.keyToIndex.get(key);
        if (index === undefined) {
            return -1;
        }
        
        this.moveToHead(index);
        return this.indexToValue[index];
    }

    put(key: string, value: number): void {
        const index = this.keyToIndex.get(key);

        if (index !== undefined) {
            // Key exists, update value and move to head
            this.indexToValue[index] = value;
            this.moveToHead(index);
        } else {
            // Key doesn't exist
            if (this.count >= this.capacity) {
                // Evict least recently used
                const lruIndex = this.tail;
                if (lruIndex !== -1) {
                    this.keyToIndex.delete(this.indexToKey[lruIndex]);
                    this.free(lruIndex);
                }
            } else {
                // Not full, allocate new node
                const newIndex = this.allocate();
                this.keyToIndex.set(key, newIndex);
                this.indexToKey[newIndex] = key;
                this.indexToValue[newIndex] = value;
                this.addToHead(newIndex);
            }
        }
    }

    remove(key: string): void {
        const index = this.keyToIndex.get(key);
        if (index !== undefined) {
            this.keyToIndex.delete(key);
            this.removeNode(index);
            this.free(index);
        }
    }

    getKeysOrdered(): string[] {
        const result: string[] = [];
        let current = this.head;
        while (current !== -1) {
            result.push(this.indexToKey[current]);
            current = this.next[current];
        }
        return result;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;

    const lines = input.split("\n");
    const firstLine = lines[0].trim().split(/\s+/);
    const capacity = parseInt(firstLine[0], 10);
    const numOperations = parseInt(firstLine[1], 10);

    const cache = new LRUCache(capacity);
    const getResults: string[] = [];
    let hasGet = false;

    for (let i = 1; i <= numOperations; i++) {
        const line = lines[i].trim();
        const parts = line.split(/\s+/);
        const op = parts[0];
        const key = parts[1];

        if (op === "GET") {
            const value = cache.get(key);
            getResults.push(value.toString());
            hasGet = true;
        } else if (op === "PUT") {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (op === "DEL") {
            cache.remove(key);
        }
    }

    if (hasGet) {
        console.log(getResults.join(" "));
    } else {
        console.log("EMPTY");
    }

    const remainingKeys = cache.getKeysOrdered();
    if (remainingKeys.length > 0) {
        console.log(remainingKeys.join(" "));
    } else {
        console.log("EMPTY");
    }
}

main();
