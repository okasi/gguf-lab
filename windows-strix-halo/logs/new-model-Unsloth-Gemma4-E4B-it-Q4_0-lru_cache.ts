import * as fs from 'fs';

// --- Doubly Linked List Node ---
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

// --- LRU Cache Implementation ---
class LRUCache {
    capacity: number;
    cache: Map<string, Node>;
    head: Node; // Dummy head (MRU position)
    tail: Node; // Dummy tail (LRU position)

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map<string, Node>();
        
        // Initialize dummy nodes
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        
        this.head.next = this.tail;
        this.tail.prev = this.head;
        
        this.head.prev = null; // Ensure head is properly terminated
        this.tail.next = null; // Ensure tail is properly terminated
    }

    /** Helper: Removes a node from the list */
    private removeNode(node: Node): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }

    /** Helper: Adds a node right after the head (making it MRU) */
    private addNode(node: Node): void {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    /** Helper: Moves an existing node to the MRU position (head) */
    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.addNode(node);
    }

    /** 
     * GET operation. Returns the value or -1.
     * O(1)
     */
    get(key: string): number {
        const node = this.cache.get(key);
        if (!node) {
            return -1;
        }

        // Found: Update usage (move to MRU)
        this.moveToHead(node);
        return node.value;
    }

    /**
     * PUT operation. Updates/inserts.
     * O(1) amortized
     */
    put(key: string, value: number): void {
        let node = this.cache.get(key);

        if (node) {
            // Update existing key
            node.value = value;
            this.moveToHead(node);
        } else {
            // New key insertion
            
            // Check capacity and evict if necessary
            if (this.cache.size >= this.capacity) {
                // LRU is the node right before the tail
                const lruNode = this.tail.prev!;
                
                // Remove from list and cache
                this.removeNode(lruNode);
                this.cache.delete(lruNode.key);
            }

            // Create new node
            const newNode = new Node(key, value);
            this.cache.set(key, newNode);
            this.addNode(newNode);
        }
    }

    /**
     * DEL operation. Removes the key.
     * O(1)
     */
    delete(key: string): void {
        const node = this.cache.get(key);
        if (node) {
            this.removeNode(node);
            this.cache.delete(key);
        }
    }

    /** Retrieves all current keys ordered from MRU to LRU. */
    getKeysInOrder(): string[] {
        const keys: string[] = [];
        let currentNode = this.head.next;
        while (currentNode !== this.tail) {
            keys.push(currentNode.key);
            currentNode = currentNode.next;
        }
        return keys;
    }
}

/**
 * Main function to read input, run operations, and print output.
 */
function solve() {
    // Read all input from stdin (file descriptor 0)
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split('\n');

    if (lines.length === 0) return;

    // 1. Parse capacity C and operation count N
    const header = lines[0].trim().split(' ');
    const capacity = parseInt(header[0], 10);
    const numOperations = parseInt(header[1], 10);

    // 2. Initialize cache and state
    const cache = new LRUCache(capacity);
    const getResults: number[] = [];

    // 3. Process operations
    for (let i = 1; i <= numOperations; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(' ');
        const operation = parts[0];
        const key = parts[1];

        try {
            switch (operation) {
                case 'PUT':
                    // Value is guaranteed to be a signed 32-bit integer
                    const valuePut = parseInt(parts[2], 10);
                    cache.put(key, valuePut);
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
            // (Though constraints assume valid input)
        }
    }

    // 4. Output Generation

    // First line: GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(' '));
    }

    // Second line: Current keys in order (MRU to LRU)
    const finalKeys = cache.getKeysInOrder();
    if (finalKeys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(finalKeys.join(' '));
    }
}

solve();
