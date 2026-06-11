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
    private size: number;
    private freeListHead: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.head = 0;
        this.tail = 0;
        // We'll use two arrays: one for allocated nodes, one for free nodes.
        // To handle dynamic allocation, we use a free list.
        // However, since we know max nodes = capacity, we can pre-allocate arrays of size capacity + 2 (for sentinel nodes).
        // Actually, simpler: use a single set of arrays of size capacity, and a free list to manage indices.
        // But for simplicity and O(1), let's just use two pools: used and free.
        // Even simpler: use a fixed-size array for all nodes, and a free list.
        
        this.next = new Array(capacity).fill(-1);
        this.prev = new Array(capacity).fill(-1);
        this.indexToKey = new Array(capacity);
        this.indexToValue = new Array(capacity);
        this.keyToIndex = new Map<string, number>();
        this.freeListHead = -1;
        
        // Initialize free list
        for (let i = 0; i < capacity; i++) {
            this.next[i] = i + 1;
        }
        this.next[capacity - 1] = -1;
        
        // Sentinel nodes for doubly linked list
        // Index 0: head sentinel
        // Index 1: tail sentinel
        // This complicates things because we have capacity nodes + 2 sentinels.
        // Let's restructure: use indices 0..capacity-1 for data nodes.
        // Sentinels are just headRef and tailRef indices.
        this.head = -1;
        this.tail = -1;
    }

    private removeFromList(index: number): void {
        if (this.prev[index] !== -1) {
            this.next[this.prev[index]] = this.next[index];
        } else {
            // This is the head
            this.head = this.next[index];
        }
        if (this.next[index] !== -1) {
            this.prev[this.next[index]] = this.prev[index];
        } else {
            // This is the tail
            this.tail = this.prev[index];
        }
        this.next[index] = -1;
        this.prev[index] = -1;
    }

    private addToHead(index: number): void {
        this.prev[index] = -1;
        this.next[index] = this.head;
        if (this.head !== -1) {
            this.prev[this.head] = index;
        }
        this.head = index;
        if (this.tail === -1) {
            this.tail = index;
        }
    }

    private addToTail(index: number): void {
        this.prev[index] = this.tail;
        this.next[index] = -1;
        if (this.tail !== -1) {
            this.next[this.tail] = index;
        }
        this.tail = index;
        if (this.head === -1) {
            this.head = index;
        }
    }

    private removeLast(): number | null {
        if (this.tail === -1) {
            return null;
        }
        const index = this.tail;
        this.tail = this.prev[index];
        if (this.tail !== -1) {
            this.next[this.tail] = -1;
        } else {
            this.head = -1;
        }
        this.prev[index] = -1;
        this.next[index] = -1;
        return index;
    }

    public put(key: string, value: number): void {
        if (this.keyToIndex.has(key)) {
            const index = this.keyToIndex.get(key)!;
            this.indexToValue[index] = value;
            // Move to head
            this.removeFromList(index);
            this.addToHead(index);
        } else {
            // Check capacity
            if (this.size === this.capacity) {
                // Evict LRU (tail)
                const evictIndex = this.removeLast();
                if (evictIndex !== null) {
                    this.keyToIndex.delete(this.indexToKey[evictIndex]);
                    this.indexToKey[evictIndex] = "";
                    this.indexToValue[evictIndex] = 0;
                    this.size--;
                    // Add to free list
                    this.next[evictIndex] = this.freeListHead;
                    this.freeListHead = evictIndex;
                }
            }
            // Allocate new node
            const index = this.freeListHead;
            if (index === -1) {
                // This shouldn't happen since we just evicted one
                throw new Error("No free nodes available");
            }
            this.freeListHead = this.next[index];
            this.next[index] = -1;
            this.prev[index] = -1;
            
            this.indexToKey[index] = key;
            this.indexToValue[index] = value;
            this.keyToIndex.set(key, index);
            this.size++;
            this.addToHead(index);
        }
    }

    public get(key: string): number {
        if (!this.keyToIndex.has(key)) {
            return -1;
        }
        const index = this.keyToIndex.get(key)!;
        // Move to head
        this.removeFromList(index);
        this.addToHead(index);
        return this.indexToValue[index];
    }

    public del(key: string): void {
        if (!this.keyToIndex.has(key)) {
            return;
        }
        const index = this.keyToIndex.get(key)!;
        this.removeFromList(index);
        this.keyToIndex.delete(key);
        this.indexToKey[index] = "";
        this.indexToValue[index] = 0;
        this.size--;
        // Add to free list
        this.next[index] = this.freeListHead;
        this.freeListHead = index;
    }

    public getKeysFromMRUToLRU(): string[] {
        const result: string[] = [];
        let curr = this.head;
        while (curr !== -1) {
            result.push(this.indexToKey[curr]);
            curr = this.next[curr];
        }
        return result;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [C_str, N_str] = lines[0].split(" ");
    const C = parseInt(C_str);
    const N = parseInt(N_str);

    const cache = new LRUCache(C);
    const getResults: string[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        const parts = line.split(" ");
        const operation = parts[0];
        if (operation === "PUT") {
            const key = parts[1];
            const value = parseInt(parts[2]);
            cache.put(key, value);
        } else if (operation === "GET") {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(String(result));
        } else if (operation === "DEL") {
            const key = parts[1];
            cache.del(key);
        }
    }

    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(" "));
    }

    const keys = cache.getKeysFromMRUToLRU();
    if (keys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(keys.join(" "));
    }
}

main();
