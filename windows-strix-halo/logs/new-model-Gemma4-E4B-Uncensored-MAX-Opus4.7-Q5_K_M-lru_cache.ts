import * as fs from 'fs';

/**
 * Node structure for the doubly linked list representing access order.
 * Head is Most Recently Used. Tail is Least Recently Used.
 */
interface CacheNode {
    key: string;
    value: number;
    prev: LRUCacheNode | null;
    next: LRUCacheNode | null;
}

class LRUCache {
    private map: Map<string, CacheNode> = new Map();
    private head: LRUCacheNode | null = null;
    private tail: LRUCacheNode | null = null;
    private capacity: number;
    private size: number = 0;

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    /**
     * Removes a node from its current position in the list.
     * O(1) since we have direct pointers.
     */
    _remove(node: CacheNode): void {
        const prev = node.prev;
        const next = node.next;

        if (prev) {
            prev.next = next;
        } else {
            this.head = next;
        }

        if (next) {
            next.prev = prev;
        } else {
            this.tail = prev;
        }

        this.map.delete(node.key);
        this.size--;
    }

    /**
     * Moves a node to the front (MRU position).
     * O(1).
     */
    private _moveToFront(node: CacheNode): void {
        // If already head, do nothing
        if (this.head === node) return;

        // Detach node
        this._remove(node);

        // Attach to front
        node.prev = null;
        node.next = this.head;
        this.head = node;

        if (this.tail === node) {
            this.tail = node;
        }
        // If head was tail, it's now both
        if (this.head === this.tail) {
            this.head = node;
            this.tail = node;
        }
    }

    /**
     * Evicts the Least Recently Used item.
     * O(1) because tail is directly accessible.
     */
    private evict(): void {
        const lru = this.tail;
        if (lru) {
            this._remove(lru);
        }
    }

    /**
     * Gets a value from the cache, updating its position to MRU.
     * O(1) amortized.
     */
    get(key: string): number {
        const node = this.map.get(key);
        return node ? node.value : -1;
    }

    /**
     * Puts or updates a key-value pair.
     * O(1) amortized.
     */
    put(key: string, value: number): void {
        const node = this.map.get(key);

        if (node) {
            // Update
            node.value = value;
            this._moveToFront(node);
        } else {
            // New item
            if (this.size >= this.capacity) {
                this.evict();
            }

            const newNode: CacheNode = {
                key,
                value,
                prev: null,
                next: this.head,
            };

            this.map.set(key, newNode);
            this.size++;

            // Insert at front
            if (this.head) {
                this.head.prev = newNode;
            }
            this.head = newNode;
            if (!this.tail) this.tail = newNode;
        }
    }

    /**
     * Deletes the key if present.
     * O(1).
     */
    del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this._remove(node);
        }
    }

    /**
     * Returns keys ordered from MRU (head) to LRU (tail).
     * O(C) where C is capacity, acceptable since C <= 200000.
     */
    getKeys(): string[] {
        const keys: string[] = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }

    get size(): number {
        return this.size;
    }
}

function solve(input: string): void {
    const lines = input.trim().split('\n');
    if (lines.length === 0) return;

    // First line C N
    const [C_str, N_str] = lines[0].split(' ');
    const CAPACITY = parseInt(C_str);
    const OPERATIONS = parseInt(N_str);

    const cache = new LRUCache(CAPACITY);
    const getResults: number[] = [];
    const keys = new Set<string>();

    for (let i = 1; i <= OPERATIONS; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        const command = parts[0].toUpperCase();
        const key = parts[1];

        switch (command) {
            case 'PUT':
                // Value can be negative, so we parse as signed 32-bit
                const value = parseInt(parts[2], 10);
                cache.put(key, value);
                break;
            case 'GET':
                const result = cache.get(key);
                getResults.push(result);
                keys.add(key);
                break;
            case 'DEL':
                cache.del(key);
                break;
            default:
                // Ignore unknown commands
        }
    }

    // Output GET results
    console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');

    // Output remaining keys (MRU first)
    const remainingKeys = Array.from(cache.map.keys()).join(' ');
    console.log(remainingKeys || 'EMPTY');
}

try {
    const input = fs.readFileSync(0, "utf8");
    solve(input);
} catch (e) {
    // Handle file read errors if stdin is not piped
    console.error("Error reading input:", e);
}
// End of file
