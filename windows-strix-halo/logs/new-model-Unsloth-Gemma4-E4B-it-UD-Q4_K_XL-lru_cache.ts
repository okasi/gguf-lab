import * as fs from 'fs';

/**
 * Represents a node in the Doubly Linked List.
 * Stores the key and value, and pointers to previous and next nodes.
 */
class DLLNode<K, V> {
    key: K;
    value: V;
    prev: DLLNode<K, V> | null;
    next: DLLNode<K, V> | null;

    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

/**
 * Implements the LRU Cache mechanism using a Map and a Doubly Linked List.
 */
class LRUCache<K, V> {
    private capacity: number;
    // Map stores key -> DLLNode for O(1) lookup
    private cacheMap: Map<K, DLLNode<K, V>>;
    // Head is Most Recently Used (MRU), Tail is Least Recently Used (LRU)
    private head: DLLNode<K, V>;
    private tail: DLLNode<K, V>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cacheMap = new Map();

        // Initialize dummy head and tail nodes for easier list management
        this.head = new DLLNode<K, V>(null as K, null as V);
        this.tail = new DLLNode<K, V>(null as K, null as V);
        
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    /**
     * Moves an existing node to the head (MRU position).
     * O(1)
     */
    private moveToHead(node: DLLNode<K, V>): void {
        // 1. Remove the node from its current position
        this.removeNode(node);
        // 2. Add it right after the dummy head
        this.addNode(node);
    }

    /**
     * Adds a new node right after the dummy head (MRU position).
     * O(1)
     */
    private addNode(node: DLLNode<K, V>): void {
        // Node connections
        node.prev = this.head;
        node.next = this.head.next;

        // Neighbor connections
        this.head.next!.prev = node;
        this.head.next = node;
    }

    /**
     * Removes a specific node from the linked list.
     * O(1)
     */
    private removeNode(node: DLLNode<K, V>): void {
        const prev = node.prev!;
        const next = node.next!;
        
        prev.next = next;
        next.prev = prev;
    }

    /**
     * Evicts the Least Recently Used item (the node before the dummy tail).
     * O(1)
     */
    private removeTail(): K | undefined {
        const lruNode = this.tail.prev!;
        
        this.removeNode(lruNode);
        this.cacheMap.delete(lruNode.key);
        return lruNode.key;
    }

    /**
     * Retrieves a value for a key. If found, marks it as MRU.
     * O(1)
     */
    public get(key: K): number {
        const node = this.cacheMap.get(key);
        if (!node) {
            return -1;
        }
        
        // Update usage: move to head
        this.moveToHead(node);
        return node.value;
    }

    /**
     * Inserts or updates a key-value pair.
     * O(1)
     */
    public put(key: K, value: number): void {
        let node = this.cacheMap.get(key);

        if (node) {
            // Update existing key
            node.value = value;
            this.moveToHead(node);
        } else {
            // New key insertion
            const newNode = new DLLNode(key, value);
            this.cacheMap.set(key, newNode);
            this.addNode(newNode);

            // Check capacity and evict if necessary
            if (this.cacheMap.size > this.capacity) {
                this.removeTail();
            }
        }
    }

    /**
     * Deletes a key from the cache.
     * O(1)
     */
    public delete(key: K): void {
        const node = this.cacheMap.get(key);
        if (node) {
            this.removeNode(node);
            this.cacheMap.delete(key);
        }
    }

    /**
     * Returns the keys in MRU order.
     * O(C) where C is current cache size
     */
    public getKeysInOrder(): string[] {
        const keys: string[] = [];
        let current = this.head.next;

        // Traverse from head (MRU) until the dummy tail
        while (current !== this.tail) {
            keys.push(current.key as string);
            current = current.next;
        }
        return keys;
    }
}

function solve() {
    // Read all input from standard input (fd 0)
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');

    if (input.length === 0 || input[0].trim() === '') {
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }

    // Parse capacity (C) and number of operations (N)
    const header = input[0].split(' ').map(s => parseInt(s.trim()));
    const capacity = header[0];
    // const N = header[1]; // N is implicitly the rest of the lines

    const cache = new LRUCache<string, number>(capacity);
    const getResults: number[] = [];

    // Process operations starting from the second line
    for (let i = 1; i < input.length; i++) {
        const line = input[i].trim();
        if (line === '') continue;

        const parts = line.split(/\s+/);
        const command = parts[0];
        const key = parts[1] || '';

        try {
            switch (command) {
                case 'PUT':
                    const value = parseInt(parts[2]);
                    cache.put(key, value);
                    break;
                case 'GET':
                    const result = cache.get(key);
                    getResults.push(result);
                    break;
                case 'DEL':
                    cache.delete(key);
                    break;
            }
        } catch (e) {
            // Handle potential parsing errors gracefully if input format is unexpected
            // console.error("Error processing line:", line, e);
        }
    }

    // --- Output Generation ---

    // 1. GET results line
    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(' '));
    }

    // 2. Remaining keys line (MRU to LRU)
    const remainingKeys = cache.getKeysInOrder();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(remainingKeys.join(' '));
    }
}

solve();
