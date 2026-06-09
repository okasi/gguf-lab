const fs = require('fs');

/**
 * Represents a node in the Doubly Linked List.
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
 * Implements the LRU Cache logic.
 */
class LRUCache {
    private capacity: number;
    private cache: Map<string, Node> = new Map();
    private head: Node | null = null; // Most Recently Used (MRU)
    private tail: Node | null = null; // Least Recently Used (LRU)

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    /**
     * Removes a node from its current position in the list.
     * @param node The node to remove.
     */
    private removeNode(node: Node): void {
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
     * Moves an existing node to the head (MRU position).
     * @param node The node to move.
     */
    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.insertAtHead(node);
    }

    /**
     * Inserts a new node at the head (MRU position).
     * @param node The node to insert.
     */
    private insertAtHead(node: Node): void {
        if (!this.head) {
            this.head = node;
            this.tail = node;
        } else {
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
        }
    }

    /**
     * Removes the Least Recently Used (LRU) node (the tail).
     */
    private popTail(): Node | null {
        if (!this.tail) {
            return null;
        }
        const lruNode = this.tail;
        this.removeNode(lruNode);
        return lruNode;
    }

    /**
     * Handles the PUT operation.
     * @param key The key.
     * @param value The value.
     */
    put(key: string, value: number): void {
        if (this.cache.has(key)) {
            // Update existing key
            const node = this.cache.get(key)!;
            node.value = value;
            this.moveToHead(node);
        } else {
            // Insert new key
            const newNode = new Node(key, value);
            this.cache.set(key, newNode);
            this.insertAtHead(newNode);

            // Check capacity
            if (this.cache.size > this.capacity) {
                const evictedNode = this.popTail();
                if (evictedNode) {
                    this.cache.delete(evictedNode.key);
                }
            }
        }
    }

    /**
     * Handles the GET operation.
     * @param key The key to retrieve.
     * @returns The value if found, otherwise -1.
     */
    get(key: string): number {
        const node = this.cache.get(key);
        if (node) {
            // Key found: Move to head (MRU)
            this.moveToHead(node);
            return node.value;
        }
        return -1; // Not found
    }

    /**
     * Handles the DEL operation.
     * @param key The key to delete.
     */
    del(key: string): void {
        const node = this.cache.get(key);
        if (node) {
            this.cache.delete(key);
            this.removeNode(node);
        }
    }

    /**
     * Gets the keys ordered from MRU to LRU.
     * @returns Array of keys.
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
    // Read all input synchronously
    const input = fs.readFileSync(0, "utf8").trim().split('\n');

    if (input.length === 0 || input[0].trim() === '') {
        return;
    }

    // Parse Capacity (C) and Number of Operations (N)
    const firstLine = input[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;

    const C = parseInt(firstLine[1]);
    const N = parseInt(firstLine[2]);

    const cache = new LRUCache(C);
    const getResults: number[] = [];
    let getCount = 0;

    // Process N operations starting from line 1
    for (let i = 1; i <= N; i++) {
        if (!input[i]) continue;
        const parts = input[i].trim().split(/\s+/);
        const operation = parts[0];
        const key = parts[1];

        switch (operation) {
            case 'PUT':
                const value = parseInt(parts[2]);
                cache.put(key, value);
                break;

            case 'GET':
                const result = cache.get(key);
                getResults.push(result);
                getCount++;
                break;

            case 'DEL':
                cache.del(key);
                break;
        }
    }

    // --- Output Generation ---

    // 1. GET Results
    let output1 = "";
    if (getCount > 0) {
        output1 = getResults.join(' ');
    } else {
        output1 = "EMPTY";
    }
    console.log(output1);

    // 2. Remaining Keys (MRU to LRU)
    const orderedKeys = cache.getOrderedKeys();
    let output2 = "";
    if (orderedKeys.length > 0) {
        output2 = orderedKeys.join(' ');
    } else {
        output2 = "EMPTY";
    }
    console.log(output2);
}

solve();
