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
        this.cacheMap = new Map<string, CacheNode>();
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

        // 2. Add to the head
        node.next = this.head;
        node.prev = null;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;

        if (!this.tail) {
            // List was empty, the added node is both head and tail
            this.tail = node;
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
            // List was empty
            this.tail = node;
        }
    }

    /**
     * Removes a node from the list.
     */
    private removeNode(node: CacheNode): void {
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
        node.prev = null;
        node.next = null;
    }

    /**
     * Handles the PUT operation.
     * @returns true if the key was inserted/updated, false if error (not applicable here).
     */
    public put(key: string, value: number): void {
        if (this.cacheMap.has(key)) {
            // Update existing key and move to head
            const node = this.cacheMap.get(key)!;
            node.value = value;
            this.moveToHead(node);
        } else {
            // New key
            const newNode = new CacheNode(key, value);

            if (this.cacheMap.size >= this.capacity) {
                // Evict LRU (the tail)
                if (this.tail) {
                    const lruKey = this.tail.key;
                    this.removeNode(this.tail);
                    this.cacheMap.delete(lruKey);
                }
            }

            // Insert new node at head
            this.addNodeToHead(newNode);
            this.cacheMap.set(key, newNode);
        }
    }

    /**
     * Handles the GET operation.
     * @returns The value if found, otherwise -1.
     */
    public get(key: string): number {
        if (!this.cacheMap.has(key)) {
            return -1;
        }
        const node = this.cacheMap.get(key)!;
        // Access makes it most recently used
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
     * Returns the keys from MRU to LRU.
     * @returns Array of keys in order.
     */
    public getKeysOrder(): string[] {
        const keys: string[] = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

/**
 * Main function to handle input/output.
 */
function solve() {
    // Read all input data from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');

    if (input.length === 0 || input[0].trim() === '') return;

    // Parse C and N from the first line
    const [cStr, nStr] = input[0].trim().split(/\s+/);
    const C = parseInt(cStr);
    const N = parseInt(nStr);

    if (isNaN(C) || isNaN(N) || C < 1 || N < 1) return;

    const lruCache = new LRUCache(C);
    const getResults: number[] = [];

    // Process N operations starting from the second line (index 1)
    for (let i = 1; i <= N; i++) {
        const line = input[i]?.trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        const command = parts[0];
        const key = parts[1];

        if (command === 'PUT') {
            const value = parseInt(parts[2]);
            lruCache.put(key, value);
        } else if (command === 'GET') {
            const result = lruCache.get(key);
            getResults.push(result);
        } else if (command === 'DEL') {
            lruCache.delete(key);
        }
    }

    // --- Output Formatting ---

    // 1. First line: all GET results separated by spaces, or EMPTY if there were no GET operations.
    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(' '));
    }

    // 2. Second line: remaining keys from most-recently-used to least-recently-used separated by spaces, or EMPTY if cache is empty.
    const keysOrder = lruCache.getKeysOrder();
    if (keysOrder.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(keysOrder.join(' '));
    }
}

solve();
