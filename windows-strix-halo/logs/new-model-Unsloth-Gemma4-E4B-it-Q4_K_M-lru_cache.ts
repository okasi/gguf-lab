import * as fs from 'fs';

// Define the structure for a node in the Doubly Linked List
interface Node {
    key: string;
    value: number;
    prev: Node | null;
    next: Node | null;
}

class LRUCache {
    private capacity: number;
    private cacheMap: Map<string, Node>;
    private head: Node | null; // Most Recently Used
    private tail: Node | null; // Least Recently Used

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cacheMap = new Map<string, Node>();
        this.head = null;
        this.tail = null;
    }

    // Helper: Removes a node from the DLL
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

    // Helper: Adds a node to the head (MRU)
    private addToHead(node: Node): void {
        node.next = this.head;
        node.prev = null;

        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;

        if (!this.tail) {
            // If the list was empty, the new node is also the tail
            this.tail = node;
        }
    }

    // Helper: Moves an existing node to the head (MRU)
    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.addToHead(node);
    }

    // GET operation
    public get(key: string): number {
        const node = this.cacheMap.get(key);
        if (!node) {
            return -1;
        }
        
        // Update usage: move to head
        this.moveToHead(node);
        return node.value;
    }

    // PUT operation
    public put(key: string, value: number): void {
        let node = this.cacheMap.get(key);

        if (node) {
            // Update existing key
            node.value = value;
            this.moveToHead(node);
        } else {
            // New key insertion
            const newNode: Node = {
                key: key,
                value: value,
                prev: null,
                next: null
            };

            this.cacheMap.set(key, newNode);
            this.addToHead(newNode);

            // Check capacity and evict if necessary
            if (this.cacheMap.size > this.capacity) {
                if (this.tail) {
                    // Evict LRU (tail)
                    const lruNode = this.tail;
                    this.cacheMap.delete(lruNode.key);
                    this.removeNode(lruNode);
                }
            }
        }
    }

    // DEL operation
    public del(key: string): void {
        const node = this.cacheMap.get(key);
        if (node) {
            this.cacheMap.delete(key);
            this.removeNode(node);
        }
    }

    // Getter for all remaining keys (MRU to LRU)
    public getRemainingKeys(): string[] {
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
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8").trim().split('\n');

    if (input.length === 0 || input[0] === '') {
        // Handle empty input case
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }

    // Parse C and N from the first line
    const [C_str, N_str] = input[0].split(' ');
    const capacity = parseInt(C_str);
    const N = parseInt(N_str);

    const cache = new LRUCache(capacity);
    const getResults: number[] = [];

    // Process N operations starting from the second line
    for (let i = 1; i <= N; i++) {
        const line = input[i];
        if (!line) continue;

        const parts = line.split(' ');
        const command = parts[0];
        const key = parts[1];

        switch (command) {
            case 'PUT':
                // PUT key value
                const value = parseInt(parts[2]);
                cache.put(key, value);
                break;
            case 'GET':
                // GET key
                const result = cache.get(key);
                getResults.push(result);
                break;
            case 'DEL':
                // DEL key
                cache.del(key);
                break;
        }
    }

    // --- Output Generation ---

    // 1. GET results line
    const outputGetResults = getResults.length > 0 ? getResults.join(' ') : "EMPTY";
    console.log(outputGetResults);

    // 2. Remaining keys line
    const remainingKeys = cache.getRemainingKeys();
    const outputRemainingKeys = remainingKeys.length > 0 ? remainingKeys.join(' ') : "EMPTY";
    console.log(outputRemainingKeys);
}

solve();
