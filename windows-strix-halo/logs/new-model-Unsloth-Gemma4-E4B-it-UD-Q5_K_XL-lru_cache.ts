import * as fs from 'fs';

class DLLNode {
    key: string | null;
    value: number;
    prev: DLLNode;
    next: DLLNode;

    constructor(key: string | null, value: number) {
        this.key = key;
        this.value = value;
        this.prev = null as any; // Sentinel nodes handle initial setup
        this.next = null as any;
    }
}

class LRUCache {
    private capacity: number;
    private cache: Map<string, DLLNode>;
    private head: DLLNode; // Sentinel head (MRU reference)
    private tail: DLLNode; // Sentinel tail (LRU reference)

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map();

        // Initialize sentinel nodes
        this.head = new DLLNode(null, 0);
        this.tail = new DLLNode(null, 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    // Helper to remove a node from the list
    private _removeNode(node: DLLNode): void {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    // Helper to add a node right after the head (making it MRU)
    private _addToHead(node: DLLNode): void {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }

    // Moves an existing node to the head (MRU)
    private _moveToHead(node: DLLNode): void {
        this._removeNode(node);
        this._addToHead(node);
    }

    public get(key: string): number {
        const node = this.cache.get(key);
        if (!node) {
            return -1;
        }
        // Update usage: move to head
        this._moveToHead(node);
        return node.value;
    }

    public put(key: string, value: number): void {
        let node = this.cache.get(key);

        if (node) {
            // Key exists: Update value and move to head
            node.value = value;
            this._moveToHead(node);
        } else {
            // Key is new: Check capacity
            if (this.cache.size === this.capacity) {
                // Evict LRU item (which is tail.prev)
                const lruNode = this.tail.prev;
                if (lruNode) {
                    this._removeNode(lruNode);
                    this.cache.delete(lruNode.key!);
                }
            }

            // Create new node and add it
            const newNode = new DLLNode(key, value);
            this.cache.set(key, newNode);
            this._addToHead(newNode);
        }
    }

    public delete(key: string): void {
        const node = this.cache.get(key);
        if (node) {
            this._removeNode(node);
            this.cache.delete(key);
        }
    }

    // Returns all keys from MRU to LRU
    public getKeysInOrder(): string[] {
        const keys: string[] = [];
        let currentNode = this.head.next;
        while (currentNode !== this.tail) {
            keys.push(currentNode.key!);
            currentNode = currentNode.next;
        }
        return keys;
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8").trim().split('\n');
    
    if (input.length === 0 || input[0].length === 0) {
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }

    // Parse C and N
    const [capacityStr, numOpsStr] = input[0].split(' ');
    const C = parseInt(capacityStr);
    const N = parseInt(numOpsStr);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = input[i].trim();
        if (line.length === 0) continue;

        const parts = line.split(' ');
        const operation = parts[0];
        
        if (operation === 'PUT') {
            const key = parts[1];
            // Value is guaranteed to be a signed 32-bit integer
            const value = parseInt(parts[2]); 
            cache.put(key, value);
        } else if (operation === 'GET') {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        } else if (operation === 'DEL') {
            const key = parts[1];
            cache.delete(key);
        }
    }

    // --- Output Generation ---

    // 1. GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(' '));
    }

    // 2. Remaining keys (MRU to LRU)
    const remainingKeys = cache.getKeysInOrder();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(remainingKeys.join(' '));
    }
}

solve();
