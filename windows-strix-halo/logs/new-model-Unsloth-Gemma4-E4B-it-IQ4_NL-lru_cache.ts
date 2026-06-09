import * as fs from "fs";

/**
 * Node structure for the Doubly Linked List.
 */
class Node {
    key: string;
    value: number;
    prev: Node | null;
    next: Node | null;

    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

/**
 * Implements the LRU Cache logic.
 */
class LRUCache {
    private capacity: number;
    private cacheMap: Map<string, Node>;
    private head: Node | null;
    private tail: Node | null;
    private size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cacheMap = new Map<string, Node>();
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /**
     * Helper: Adds a node to the front (MRU) of the list.
     */
    private addToHead(node: Node): void {
        if (this.head === null) {
            this.head = node;
            this.tail = node;
        } else {
            node.next = this.head;
            node.prev = null;
            this.head!.prev = node;
            this.head = node;
        }
    }

    /**
     * Helper: Removes a specified node from the list.
     */
    private removeNode(node: Node): void {
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
        
        node.prev = null;
        node.next = null;
    }

    /**
     * Helper: Moves an existing node to the front (MRU). O(1).
     */
    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.addToHead(node);
    }

    /**
     * Helper: Removes the Least Recently Used item (the tail). O(1).
     */
    private removeTail(): Node | null {
        if (this.tail === null) return null;
        
        const lruNode = this.tail;
        this.removeNode(lruNode);
        return lruNode;
    }

    /**
     * Handles GET operation. O(1).
     */
    public get(key: string): number {
        const node = this.cacheMap.get(key);
        if (!node) {
            return -1;
        }
        // Update usage
        this.moveToHead(node);
        return node.value;
    }

    /**
     * Handles PUT operation. O(1).
     */
    public put(key: string, value: number): void {
        let node = this.cacheMap.get(key);

        if (node) {
            // Key exists: Update value and move to head
            node.value = value;
            this.moveToHead(node);
        } else {
            // Key is new: Check capacity
            if (this.size === this.capacity) {
                // Evict LRU
                const evictedNode = this.removeTail();
                if (evictedNode) {
                    this.cacheMap.delete(evictedNode.key);
                }
            }

            // Insert new node
            node = new Node(key, value);
            this.cacheMap.set(key, node);
            this.addToHead(node);
            this.size++;
        }
    }

    /**
     * Handles DEL operation. O(1).
     */
    public delete(key: string): void {
        const node = this.cacheMap.get(key);
        if (node) {
            this.removeNode(node);
            this.cacheMap.delete(key);
            this.size--;
        }
    }

    /**
     * Returns keys in MRU to LRU order.
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

/**
 * Main function to read input and run the simulation.
 */
function solve() {
    try {
        // Read all input from stdin
        const input = fs.readFileSync(0, "utf8");
        const lines = input.trim().split('\n');

        if (lines.length === 0) {
            console.log("EMPTY\nEMPTY");
            return;
        }

        // Parse C and N from the first line
        const [capacityStr, numOpsStr] = lines[0].split(' ');
        const capacity = parseInt(capacityStr);
        const numOperations = parseInt(numOpsStr);

        const cache = new LRUCache(capacity);
        const getResults: number[] = [];

        // Process remaining N operations
        for (let i = 1; i <= numOperations; i++) {
            const line = lines[i];
            if (!line) continue;

            const parts = line.split(' ');
            const operation = parts[0];
            const key = parts[1];

            if (operation === 'GET') {
                const result = cache.get(key);
                getResults.push(result);
            } else if (operation === 'PUT') {
                // Value is a signed 32-bit integer
                const value = parseInt(parts[2]);
                cache.put(key, value);
            } else if (operation === 'DEL') {
                cache.delete(key);
            }
        }

        // --- Output Generation ---

        // 1. GET results
        if (getResults.length === 0) {
            console.log("EMPTY");
        } else {
            console.log(getResults.join(" "));
        }

        // 2. Remaining keys (MRU to LRU)
        const remainingKeys = cache.getKeysInOrder();
        if (remainingKeys.length === 0) {
            console.log("EMPTY");
        } else {
            console.log(remainingKeys.join(" "));
        }

    } catch (e) {
        // Handle potential file reading errors gracefully if needed,
        // but standard competitive programming constraints assume valid input.
    }
}

solve();
