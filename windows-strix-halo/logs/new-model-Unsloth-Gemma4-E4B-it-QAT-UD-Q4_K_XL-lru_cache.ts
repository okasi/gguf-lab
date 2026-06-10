import * as fs from 'fs';

/**
 * CacheNode represents a node in the doubly linked list.
 */
class CacheNode {
    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

/**
 * LRUCache implements the Least Recently Used cache logic.
 */
class LRUCache {
    private capacity: number;
    private cacheMap: Map<string, CacheNode>;
    private head: CacheNode | null;
    private tail: CacheNode | null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cacheMap = new Map();
        this.head = null;
        this.tail = null;
    }

    /**
     * Moves a node to the head (marking it as most recently used).
     * Assumes the node is already in the list.
     */
    private moveToHead(node: CacheNode): void {
        if (node === this.head) {
            return; // Already the most recent
        }

        // 1. Remove from current position
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            // Node was the head
            this.head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            // Node was the tail
            this.tail = node.prev;
        }

        // 2. Insert at the head
        node.next = this.head;
        node.prev = null;

        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;

        if (!this.tail) {
            this.tail = node; // List was empty or only had one node
        }
    }

    /**
     * Adds a new node to the head of the list.
     */
    private addNodeToHead(node: CacheNode): void {
        node.next = this.head;
        node.prev = null;

        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;

        if (!this.tail) {
            this.tail = node;
        }
    }

    /**
     * Removes a specific node from the linked list.
     */
    private removeNode(node: CacheNode): void {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            // Node is the head
            this.head = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        } else {
            // Node is the tail
            this.tail = node.prev;
        }

        // Isolate the node
        node.next = null;
        node.prev = null;
    }

    /**
     * Handles the PUT operation.
     * @returns true if the key was inserted/updated.
     */
    public put(key: string, value: number): void {
        if (this.cacheMap.has(key)) {
            // Key exists: Update value and move to head
            const node = this.cacheMap.get(key)!;
            node.value = value;
            this.moveToHead(node);
        } else {
            // New key: Insert
            const newNode = new CacheNode(key, value);
            this.cacheMap.set(key, newNode);
            this.addNodeToHead(newNode);

            // Check capacity and evict if necessary
            if (this.cacheMap.size > this.capacity) {
                this.evictLRU();
            }
        }
    }

    /**
     * Handles the GET operation.
     * @returns The value, or -1 if not found.
     */
    public get(key: string): number {
        if (!this.cacheMap.has(key)) {
            return -1;
        }
        const node = this.cacheMap.get(key)!;
        // Update usage and move to head
        this.moveToHead(node);
        return node.value;
    }

    /**
     * Handles the DEL operation.
     */
    public delete(key: string): void {
        if (this.cacheMap.has(key)) {
            const node = this.cacheMap.get(key)!;
            this.removeNode(node);
            this.cacheMap.delete(key);
        }
    }

    /**
     * Evicts the least recently used item (the tail).
     */
    private evictLRU(): void {
        if (!this.tail) return;

        const lruNode = this.tail;
        const key = lruNode.key;

        // Remove from map and list
        this.cacheMap.delete(key);
        this.removeNode(lruNode);
    }

    /**
     * Returns all keys in MRU to LRU order.
     */
    public getKeysInOrder(): string[] {
        const keys: string[] = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    
    if (input.length === 0 || input[0] === "") return;

    // Parse C and N
    const [CStr, NStr] = input[0].trim().split(/\s+/);
    const C = parseInt(CStr);
    const N = parseInt(NStr);

    const cache = new LRUCache(C);
    const operations = input.slice(1, N + 1);
    
    const getResults: string[] = [];

    for (let i = 0; i < N; i++) {
        const line = operations[i].trim();
        if (line === "") continue;

        const parts = line.split(/\s+/);
        const command = parts[0];
        const key = parts[1];

        switch (command) {
            case 'PUT':
                // Value is guaranteed to be a signed 32-bit integer
                const value = parseInt(parts[2], 10);
                cache.put(key, value);
                break;
            case 'GET':
                const result = cache.get(key);
                getResults.push(result.toString());
                break;
            case 'DEL':
                cache.delete(key);
                break;
        }
    }

    // --- Output Generation ---

    // 1. GET results
    if (getResults.length > 0) {
        console.log(getResults.join(' '));
    } else {
        console.log('EMPTY');
    }

    // 2. Remaining keys (MRU to LRU)
    const orderedKeys = cache.getKeysInOrder();
    if (orderedKeys.length > 0) {
        console.log(orderedKeys.join(' '));
    } else {
        console.log('EMPTY');
    }
}

solve();
