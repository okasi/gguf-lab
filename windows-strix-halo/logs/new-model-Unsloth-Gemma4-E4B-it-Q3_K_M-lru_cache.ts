import * as fs from 'fs';

// Define the structure for a node in the Doubly Linked List
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

// Implement the LRUCache using Map and a Doubly Linked List
class LRUCache {
    capacity: number;
    keyMap: Map<string, Node>;
    head: Node | null; // Most Recently Used (MRU)
    tail: Node | null; // Least Recently Used (LRU)

    constructor(capacity: number) {
        this.capacity = capacity;
        this.keyMap = new Map();
        this.head = null;
        this.tail = null;
    }

    // Helper function to move an existing node to the head (MRU)
    private moveToHead(node: Node): void {
        // 1. Remove the node from its current position
        if (node.prev) {
            node.prev.next = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }

        // Special case: If the node is currently the tail, update the tail pointer
        if (node === this.tail) {
            this.tail = node.prev;
            if (this.tail) {
                this.tail.next = null;
            }
        }

        // 2. Insert the node at the head
        if (this.head) {
            node.next = this.head;
            this.head.prev = node;
        } else {
            // Cache is empty
            this.tail = node;
        }
        node.prev = null;
        this.head = node;
    }

    // Helper function to add a new node to the head (MRU)
    private addToHead(node: Node): void {
        if (this.head) {
            node.next = this.head;
            this.head.prev = node;
        } else {
            // Cache is empty
            this.tail = node;
        }
        node.prev = null;
        this.head = node;
    }

    // Get operation
    get(key: string): number {
        const node = this.keyMap.get(key);
        if (!node) {
            return -1;
        }
        // Update usage (O(1))
        this.moveToHead(node);
        return node.value;
    }

    // Put operation
    put(key: string, value: number): void {
        const node = this.keyMap.get(key);

        if (node) {
            // Key exists: Update value and move to head (O(1))
            node.value = value;
            this.moveToHead(node);
        } else {
            // Key is new: Create node
            const newNode = new Node(key, value);

            // Check capacity and evict if necessary
            if (this.keyMap.size >= this.capacity) {
                // Evict the LRU item (the tail)
                const lruKey = this.tail.key;
                this.keyMap.delete(lruKey);

                // Remove the tail node from the list
                this.tail = this.tail.prev;
                if (this.tail) {
                    this.tail.next = null;
                } else {
                    // List is now empty
                    this.head = null;
                }
            }

            // Add the new node (O(1))
            this.keyMap.set(key, newNode);
            this.addToHead(newNode);
        }
    }

    // Delete operation
    delete(key: string): void {
        const node = this.keyMap.get(key);
        if (!node) {
            return;
        }

        // Remove from map
        this.keyMap.delete(key);

        // Remove from DLL
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

        // Clear node references to aid garbage collection
        node.prev = null;
        node.next = null;
    }

    // Get keys in order (MRU to LRU)
    getKeysInOrder(): string[] {
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
    // Read all input from stdin (File Descriptor 0)
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split('\n');

    if (lines.length === 0) return;

    // Parse C and N from the first line
    const firstLine = lines[0].split(' ');
    const C = parseInt(firstLine[0]);
    const N = parseInt(firstLine[1]);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim().split(' ');
        const operation = line[0];
        const key = line[1];

        if (operation === 'PUT') {
            const value = parseInt(line[2]);
            cache.put(key, value);
        } else if (operation === 'GET') {
            const result = cache.get(key);
            getResults.push(result);
        } else if (operation === 'DEL') {
            cache.delete(key);
        }
    }

    // --- Output Generation ---

    // 1. GET Results Line
    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(' '));
    }

    // 2. Remaining Keys Line
    const remainingKeys = cache.getKeysInOrder();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(remainingKeys.join(' '));
    }
}

solve();
