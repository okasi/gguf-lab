import * as fs from 'fs';

/**
 * Represents a node in the Doubly Linked List.
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
 * Implements the LRU Cache using a HashMap (Map) and a Doubly Linked List (DLL).
 * Time complexity for operations: O(1) amortized.
 */
class LRUCache {
    private capacity: number;
    private map: Map<string, Node>;
    private head: Node; // Most Recently Used
    private tail: Node; // Least Recently Used

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map<string, Node>();

        // Dummy head and tail nodes for simplified DLL manipulation
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    /**
     * Removes a node from the DLL. O(1).
     * @param node The node to remove.
     */
    private removeNode(node: Node): void {
        const prev = node.prev;
        const next = node.next;
        prev?.next = next;
        next?.prev = prev;
    }

    /**
     * Adds a node right after the head (making it MRU). O(1).
     * @param node The node to add.
     */
    private addToHead(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    /**
     * Moves an existing node to the head (MRU). O(1).
     * @param node The node to promote.
     */
    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.addToHead(node);
    }

    /**
     * Retrieves a value from the cache.
     * @param key The key to search for.
     * @returns The value if found, or -1 otherwise.
     */
    public get(key: string): number {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        // Found: Make it MRU
        this.moveToHead(node);
        return node.value;
    }

    /**
     * Inserts or updates a key-value pair.
     * @param key The key.
     * @param value The value.
     */
    public put(key: string, value: number): void {
        const existingNode = this.map.get(key);

        if (existingNode) {
            // Key exists: Update value and move to head
            existingNode.value = value;
            this.moveToHead(existingNode);
        } else {
            // Key is new: Create node
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);

            // Check capacity and evict if necessary
            if (this.map.size > this.capacity) {
                // Evict LRU (the node just before the dummy tail)
                const lruNode = this.tail.prev!;
                this.removeNode(lruNode);
                this.map.delete(lruNode.key);
            }
        }
    }

    /**
     * Deletes a key from the cache.
     * @param key The key to delete.
     */
    public del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
        }
    }

    /**
     * Returns an array of keys ordered from MRU to LRU.
     * @returns Array of keys.
     */
    public getKeysInOrder(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function main() {
    // Read all input synchronously from standard input (fd 0)
    const input = fs.readFileSync(0, "utf8");
    const lines = input.trim().split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
        console.log("EMPTY\nEMPTY");
        return;
    }

    // Parse C (Capacity) and N (Number of operations)
    const [C_str, N_str] = lines[0].split(' ');
    const capacity = parseInt(C_str);
    const numOperations = parseInt(N_str);

    const cache = new LRUCache(capacity);
    const getResults: number[] = [];

    // Process operations from line 1 up to line N
    for (let i = 1; i <= numOperations; i++) {
        const line = lines[i];
        const parts = line.split(' ');
        const command = parts[0];
        const key = parts[1];

        switch (command) {
            case 'PUT':
                // Value is expected to be an integer
                const value = parseInt(parts[2]);
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

    // --- Output Generation ---

    // 1. GET results
    const getOutput = getResults.length > 0 
        ? getResults.join(' ') 
        : "EMPTY";
    console.log(getOutput);

    // 2. Remaining keys (MRU to LRU)
    const keysInOrder = cache.getKeysInOrder();
    const keysOutput = keysInOrder.length > 0 
        ? keysInOrder.join(' ') 
        : "EMPTY";
    console.log(keysOutput);
}

main();
