const fs = require('fs');

/**
 * Node structure for the Doubly Linked List
 */
class Node {
    key: string;
    value: number;
    prev: Node | null = null;
    next: Node | null = null;

    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
    }
}

/**
 * LRUCache implementation using a Map and a Doubly Linked List
 */
class LRUCache {
    private capacity: number;
    private cacheMap: Map<string, Node> = new Map();
    private head: Node | null = null; // Most Recently Used (MRU)
    private tail: Node | null = null; // Least Recently Used (LRU)

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    /**
     * Helper function to remove a node from its current position in the list.
     * @param node The node to remove.
     */
    private removeNode(node: Node): void {
        const prev = node.prev;
        const next = node.next;

        if (prev) {
            prev.next = next;
        } else {
            // Node was the head
            this.head = next;
        }

        if (next) {
            next.prev = prev;
        } else {
            // Node was the tail
            this.tail = prev;
        }

        node.prev = null;
        node.next = null;
    }

    /**
     * Helper function to move an existing node to the head (MRU position).
     * Assumes the node is already in the list.
     * @param node The node to move.
     */
    private moveToHead(node: Node): void {
        if (node === this.head) {
            return; // Already MRU
        }

        // 1. Remove the node from its current position
        this.removeNode(node);

        // 2. Insert the node at the head
        node.next = this.head;
        node.prev = null;

        if (this.head) {
            this.head.prev = node;
        }

        this.head = node;

        if (!this.tail) {
            // Cache was empty, now it has one element
            this.tail = node;
        }
    }

    /**
     * Helper function to add a new node to the head (MRU position).
     * @param node The node to add.
     */
    private addNodeToHead(node: Node): void {
        node.next = this.head;
        node.prev = null;

        if (this.head) {
            this.head.prev = node;
        }

        this.head = node;

        if (!this.tail) {
            // Cache was empty
            this.tail = node;
        }
    }

    /**
     * Handles the PUT operation.
     * @param key The key.
     * @param value The value (signed 32-bit integer).
     */
    put(key: string, value: number): void {
        if (this.cacheMap.has(key)) {
            // Case 1: Key exists (Update)
            const node = this.cacheMap.get(key)!;
            node.value = value;
            this.moveToHead(node);
        } else {
            // Case 2: Key is new (Insert)
            
            // Eviction check
            if (this.cacheMap.size >= this.capacity) {
                // Cache is full, evict LRU (tail)
                if (this.tail) {
                    const lruKey = this.tail.key;
                    this.cacheMap.delete(lruKey);
                    this.removeNode(this.tail);
                }
            }

            // Insert new node
            const newNode = new Node(key, value);
            this.cacheMap.set(key, newNode);
            this.addNodeToHead(newNode);
        }
    }

    /**
     * Handles the GET operation.
     * @param key The key.
     * @returns The value if found, otherwise -1.
     */
    get(key: string): number {
        if (this.cacheMap.has(key)) {
            const node = this.cacheMap.get(key)!;
            // Update usage (MRU)
            this.moveToHead(node);
            return node.value;
        }
        return -1;
    }

    /**
     * Handles the DEL operation.
     * @param key The key.
     */
    del(key: string): void {
        if (this.cacheMap.has(key)) {
            const node = this.cacheMap.get(key)!;
            this.cacheMap.delete(key);
            this.removeNode(node);
        }
    }

    /**
     * Returns keys ordered from MRU to LRU.
     * @returns An array of keys.
     */
    getOrderedKeys(): string[] {
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
    // Read all input from stdin
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    if (input.length === 0 || input[0] === '') return;

    // 1. Parse Capacity and Number of Operations
    const firstLine = input[0].trim().split(/\s+/);
    const C = parseInt(firstLine[1], 10);
    const N = parseInt(firstLine[2], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    // 2. Process Operations
    for (let i = 1; i <= N; i++) {
        if (!input[i]) continue;
        const line = input[i].trim();
        if (line === '') continue;

        const parts = line.split(/\s+/);
        const operation = parts[0];
        const key = parts[1];

        switch (operation) {
            case 'PUT':
                // Value is guaranteed to be a signed 32-bit integer
                const value = parseInt(parts[2], 10);
                cache.put(key, value);
                break;

            case 'GET':
                const result = cache.get(key);
                getResults.push(result);
                break;

            case 'DEL':
                cache.del(key);
                break;
        }
    }

    // 3. Generate Output

    // Output 1: GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(' '));
    }

    // Output 2: Remaining keys (MRU to LRU)
    const orderedKeys = cache.getOrderedKeys();
    if (orderedKeys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(orderedKeys.join(' '));
    }
}

solve();
