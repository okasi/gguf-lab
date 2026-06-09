import * as fs from 'fs';

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

class LRUCache {
    private capacity: number;
    private size: number = 0;
    // Maps key to the actual Node object stored in the DLL
    private cacheMap: Map<string, Node> = new Map();
    // Sentinel nodes for the DLL
    private head: Node = new Node("", 0); // MRU side
    private tail: Node = new Node("", 0); // LRU side

    constructor(capacity: number) {
        this.capacity = capacity;
        // Initialize DLL structure: Head -> Tail
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    /**
     * Removes a node from the DLL. O(1)
     */
    private removeNode(node: Node): void {
        const prevNode = node.prev;
        const nextNode = node.next;

        if (prevNode) {
            prevNode.next = nextNode;
        }
        if (nextNode) {
            nextNode.prev = prevNode;
        }

        node.prev = null;
        node.next = null;
    }

    /**
     * Moves a node to the head (MRU). O(1)
     */
    private moveToHead(node: Node): void {
        // 1. Remove it from its current spot
        if (node.prev !== null || node.next !== null) {
            this.removeNode(node);
        }
        // 2. Re-insert it at the head
        this.addNode(node);
    }

    /**
     * Adds a node to the head (MRU). O(1)
     */
    private addNode(node: Node): void {
        // Current head is the node immediately after the sentinel head
        const currentHeadNext = this.head.next;
        
        // Set up pointers
        node.prev = this.head;
        node.next = currentHeadNext;

        // Update surrounding nodes' pointers
        this.head.next = node;
        if (currentHeadNext) {
            currentHeadNext.prev = node;
        }
        
        // Ensure the node is properly linked
        this.removeNode(node); // Remove to ensure the pointers are clean before insertion
        this.head.next = node;
        node.prev = this.head;
        
        if (currentHeadNext) {
            currentHeadNext.prev = node;
        }
        
        // If the list only has one item (or is empty), we need to handle the tail pointer if necessary
        // Since we use sentinel nodes, we just ensure the head points to the new node.
    }

    /**
     * Retrieves the value for a key. O(1)
     * @returns value or null if not found
     */
    public get(key: string): number | null {
        const node = this.cacheMap.get(key);
        if (!node) {
            return null;
        }
        // Found it, make it MRU
        this.moveToHead(node);
        return node.value;
    }

    /**
     * Inserts or updates a key-value pair. O(1)
     */
    public put(key: string, value: number): void {
        let node = this.cacheMap.get(key);

        if (node) {
            // Key exists: Update value and move to MRU
            node.value = value;
            this.moveToHead(node);
            return;
        }

        // Key does not exist: New insertion
        const newNode = new Node(key, value);
        
        // Check capacity
        if (this.size >= this.capacity) {
            // Evict LRU node (the node before the tail sentinel)
            const lruNode = this.tail.prev;
            if (lruNode && lruNode !== this.head) {
                this.removeNode(lruNode);
                this.cacheMap.delete(lruNode.key);
                this.size--;
            }
        }

        // Insert the new node (which acts as the MRU)
        this.cacheMap.set(key, newNode);
        this.addNode(newNode);
        this.size++;
    }

    /**
     * Removes a key from the cache. O(1)
     */
    public delete(key: string): boolean {
        const node = this.cacheMap.get(key);
        if (!node) {
            return false;
        }

        // Remove node from DLL and map
        this.removeNode(node);
        this.cacheMap.delete(key);
        this.size--;
        return true;
    }

    /**
     * Generates the ordered list of keys for output. O(K) where K is size.
     */
    public getOrderedKeys(): string[] {
        const keys: string[] = [];
        let current = this.head.next;

        // Iterate from MRU (after head) to LRU (before tail)
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function main() {
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split('\n');

    if (lines.length === 0) return;

    // Parse C and N
    const [capacityStr, NStr] = lines[0].split(' ');
    const C = parseInt(capacityStr);
    const N = parseInt(NStr);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    // Process operations from line 1 onwards
    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        if (!line) continue;

        const parts = line.split(' ');
        const operation = parts[0];
        const key = parts[1];
        
        // Handle value parsing carefully (signed 32-bit integer)
        let value: number | null = null;
        if (operation === 'PUT' || operation === 'DEL') {
            // If PUT, the second argument is the value.
            if (operation === 'PUT') {
                value = parseInt(parts[2]);
            }
        }

        switch (operation) {
            case 'PUT':
                if (value !== null) {
                    cache.put(key, value);
                }
                break;
            case 'GET':
                const result = cache.get(key);
                // GET should output the value if present, otherwise -1
                const outputValue = result === null ? -1 : result;
                getResults.push(outputValue);
                break;
            case 'DEL':
                cache.delete(key);
                break;
        }
    }

    // --- Output Formatting ---

    // 1. GET results
    const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    console.log(getOutput);

    // 2. Remaining keys (MRU to LRU)
    const orderedKeys = cache.getOrderedKeys();
    const keyOutput = orderedKeys.length > 0 ? orderedKeys.join(' ') : 'EMPTY';
    console.log(keyOutput);
}

main();
