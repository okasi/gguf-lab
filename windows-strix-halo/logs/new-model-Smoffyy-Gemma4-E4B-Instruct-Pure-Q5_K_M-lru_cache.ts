import * as fs from 'fs';

/**
 * Represents a node in the Doubly Linked List.
 * Stores the key, value, and pointers to neighbors.
 */
class ListNode {
    key: string;
    value: number;
    prev: ListNode | null;
    next: ListNode | null;

    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

/**
 * Implements the LRU Cache logic using a Map and a Doubly Linked List.
 * Time Complexity: O(1) amortized per operation.
 */
class LRUCache {
    private capacity: number;
    private cacheMap: Map<string, ListNode>;
    
    // Sentinel nodes for the DLL
    private head: ListNode; // MRU (Most Recently Used)
    private tail: ListNode; // LRU (Least Recently Used)

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cacheMap = new Map<string, ListNode>();

        // Initialize sentinel nodes
        this.head = new ListNode("__HEAD__", 0);
        this.tail = new ListNode("__TAIL__", 0);

        // Link head and tail initially
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    /**
     * Removes a node from its current position in the DLL. O(1).
     */
    private removeNode(node: ListNode): void {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    /**
     * Inserts a node right after the head (making it MRU). O(1).
     */
    private addNodeToHead(node: ListNode): void {
        // Node goes between head and head.next
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    /**
     * Moves an existing node to the head (MRU position). O(1).
     */
    private moveToHead(node: ListNode): void {
        this.removeNode(node);
        this.addNodeToHead(node);
    }

    /**
     * Removes the Least Recently Used node (the one before the tail). O(1).
     * @returns The key of the evicted node, or null if cache is empty.
     */
    private removeTail(): string | null {
        const lruNode = this.tail.prev!;
        this.removeNode(lruNode);
        return lruNode.key;
    }

    /**
     * Handles a GET operation.
     */
    public get(key: string): number {
        if (!this.cacheMap.has(key)) {
            return -1;
        }
        const node = this.cacheMap.get(key)!;
        this.moveToHead(node); // Update recency
        return node.value;
    }

    /**
     * Handles a PUT operation.
     */
    public put(key: string, value: number): void {
        if (this.cacheMap.has(key)) {
            // Key exists: Update value and move to head
            const node = this.cacheMap.get(key)!;
            node.value = value;
            this.moveToHead(node);
        } else {
            // New key: Check capacity
            if (this.cacheMap.size >= this.capacity) {
                // Evict LRU
                const evictedKey = this.removeTail();
                if (evictedKey !== null) {
                    this.cacheMap.delete(evictedKey);
                }
            }

            // Insert new node
            const newNode = new ListNode(key, value);
            this.cacheMap.set(key, newNode);
            this.addNodeToHead(newNode);
        }
    }

    /**
     * Handles a DEL operation.
     */
    public delete(key: string): boolean {
        if (!this.cacheMap.has(key)) {
            return false;
        }
        const node = this.cacheMap.get(key)!;
        this.removeNode(node);
        this.cacheMap.delete(key);
        return true;
    }

    /**
     * Retrieves the keys in order from MRU to LRU.
     */
    public getKeysOrder(): string[] {
        const orderedKeys: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            orderedKeys.push(current.key);
            current = current.next;
        }
        return orderedKeys;
    }
}

/**
 * Main execution function.
 */
function solve() {
    // Read all input from stdin (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    
    if (input.length === 0 || input[0] === '') {
        console.log("EMPTY\nEMPTY");
        return;
    }

    // 1. Parse C and N
    const [capacityStr, numOpsStr] = input[0].split(/\s+/);
    const capacity = parseInt(capacityStr);
    const numOps = parseInt(numOpsStr);

    if (isNaN(capacity) || isNaN(numOps) || capacity <= 0) {
        console.log("EMPTY\nEMPTY");
        return;
    }
    
    const cache = new LRUCache(capacity);
    
    const getResults: number[] = [];

    // 2. Process operations
    for (let i = 1; i <= numOps && i < input.length; i++) {
        const line = input[i].trim();
        if (line === '') continue;

        const parts = line.split(/\s+/);
        const command = parts[0];
        const key = parts[1] || '';

        switch (command) {
            case 'PUT':
                // PUT key value
                const value = parseInt(parts[2]);
                if (!isNaN(value)) {
                    cache.put(key, value);
                }
                break;
            case 'GET':
                // GET key
                const result = cache.get(key);
                getResults.push(result);
                break;
            case 'DEL':
                // DEL key
                cache.delete(key);
                break;
            default:
                // Ignore unknown commands
                break;
        }
    }

    // 3. Generate Output

    // Output 1: GET results
    let output1 = '';
    if (getResults.length === 0) {
        output1 = 'EMPTY';
    } else {
        output1 = getResults.map(r => r.toString()).join(' ');
    }

    // Output 2: Remaining keys (MRU to LRU)
    const keysOrder = cache.getKeysOrder();
    let output2 = '';
    if (keysOrder.length === 0) {
        output2 = 'EMPTY';
    } else {
        output2 = keysOrder.join(' ');
    }

    console.log(output1);
    console.log(output2);
}

solve();
