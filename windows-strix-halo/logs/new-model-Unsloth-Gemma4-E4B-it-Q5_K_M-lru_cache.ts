import * as fs from 'fs';

/**
 * Node structure for the Doubly Linked List
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
 * LRUCache implementation
 */
class LRUCache {
    private capacity: number;
    private map: Map<string, Node>;
    private head: Node; // Sentinel (MRU side)
    private tail: Node; // Sentinel (LRU side)

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map<string, Node>();
        
        // Initialize sentinel nodes
        this.head = new Node("__HEAD__", 0);
        this.tail = new Node("__TAIL__", 0);
        
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    /**
     * Removes a node from its current position in the list. O(1)
     */
    private removeNode(node: Node): void {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    /**
     * Adds a node right after the head (making it MRU). O(1)
     */
    private addToHead(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;

        this.head.next!.prev = node;
        this.head.next = node;
    }

    /**
     * Moves an existing node to the head (MRU position). O(1)
     */
    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.addToHead(node);
    }

    /**
     * Evicts the least recently used node (the one before the tail). O(1)
     * @returns The key of the evicted node, or null if cache is empty.
     */
    private popTail(): string | null {
        const lruNode = this.tail.prev;
        if (lruNode === this.head) {
            // Cache is empty
            return null;
        }
        
        this.removeNode(lruNode);
        return lruNode.key;
    }

    /**
     * Handles the PUT operation. O(1)
     */
    public put(key: string, value: number): void {
        if (this.map.has(key)) {
            // Key exists: update value and move to head
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToHead(node);
        } else {
            // Key is new: create node and insert
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);

            // Check capacity and evict if necessary
            if (this.map.size > this.capacity) {
                const evictedKey = this.popTail();
                if (evictedKey !== null) {
                    this.map.delete(evictedKey);
                }
            }
        }
    }

    /**
     * Handles the GET operation. O(1)
     * @returns The value, or -1 if not found.
     */
    public get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        // Successful GET makes the key MRU
        this.moveToHead(node);
        return node.value;
    }

    /**
     * Handles the DEL operation. O(1)
     */
    public delete(key: string): void {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key)!;
        this.removeNode(node);
        this.map.delete(key);
    }

    /**
     * Retrieves the keys in MRU to LRU order.
     * @returns Array of keys.
     */
    public getKeysInOrder(): string[] {
        const keys: string[] = [];
        let current = this.head.next;

        // Traverse the list until the tail sentinel
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function solve() {
    // Read all input from standard input
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');

    if (input.length === 0 || input[0].trim() === '') {
        console.log('EMPTY\nEMPTY');
        return;
    }

    // Parse C and N from the first line
    const [capacityStr, numOpsStr] = input[0].trim().split(/\s+/);
    const C = parseInt(capacityStr);
    const N = parseInt(numOpsStr);

    const cache = new LRUCache(C);
    const operations = input.slice(1);
    
    const getResults: number[] = [];

    for (const line of operations) {
        if (line.trim() === '') continue;
        
        const parts = line.trim().split(/\s+/);
        const command = parts[0];

        switch (command) {
            case 'PUT':
                const keyPut = parts[1];
                // Value is guaranteed to be a signed 32-bit integer
                const valuePut = parseInt(parts[2]); 
                cache.put(keyPut, valuePut);
                break;
            case 'GET':
                const keyGet = parts[1];
                const result = cache.get(keyGet);
                getResults.push(result);
                break;
            case 'DEL':
                const keyDel = parts[1];
                cache.delete(keyDel);
                break;
        }
    }

    // --- Output Generation ---

    // 1. GET results
    const getOutput = getResults.length > 0 
        ? getResults.join(' ') 
        : 'EMPTY';
    console.log(getOutput);

    // 2. Remaining keys in order
    const finalKeys = cache.getKeysInOrder();
    const keyOutput = finalKeys.length > 0 
        ? finalKeys.join(' ') 
        : 'EMPTY';
    console.log(keyOutput);
}

solve();
