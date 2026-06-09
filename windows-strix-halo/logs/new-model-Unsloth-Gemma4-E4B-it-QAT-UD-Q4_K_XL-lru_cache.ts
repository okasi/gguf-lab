import * as fs from 'fs';

interface CacheEntry {
    key: string;
    value: number;
}

class LRUCache {
    private capacity: number;
    // Map for O(1) lookup
    private cacheMap: Map<string, CacheEntry>;
    // Doubly linked list structure for O(1) ordering management
    private head: DoublyLinkedListNode | null;
    private tail: DoublyLinkedListNode | null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cacheMap = new Map<string, CacheEntry>();
        this.head = null;
        this.tail = null;
    }

    private getNode(key: string): DoublyLinkedListNode | null {
        if (!this.cacheMap.has(key)) {
            return null;
        }
        const entry = this.cacheMap.get(key)!;
        // We use the map to find the entry, but the DLL node reference is what we need for list manipulation.
        // Since we don't store the DLL node reference directly in the CacheEntry,
        // we'll rely on finding the node via the map's value or re-implement the structure slightly.

        // For simplicity and adherence to O(1), we'll store the node reference in the map value.
        // Let's adjust the internal structure to map key -> Node.
        return null; // This approach requires restructuring.
    }

    // --- Reimplement using Map<Key, Node> for O(1) access ---

    private class Node {
        key: string;
        value: number;
        prev: Node | null = null;
        next: Node | null = null;

        constructor(key: string, value: number) {
            this.key = key;
            this.value = value;
        }
    }

    private map: Map<string, Node>;

    constructor_optimized(capacity: number) {
        this.capacity = capacity;
        this.map = new Map<string, this.Node>();
        this.head = new this.Node("", -1); // Dummy head
        this.tail = new this.Node("", -1); // Dummy tail
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private moveToHead(node: this.Node): void {
        // 1. Remove from current position
        node.prev?.next = node.next;
        node.next?.prev = node.prev;

        // 2. Add to front (right after dummy head)
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next?.prev = node;
        this.head.next = node;
    }

    private removeNode(node: this.Node): void {
        node.prev?.next = node.next;
        node.next?.prev = node.prev;
    }

    private getLRU(): this.Node | null {
        // LRU is the node right after the dummy head
        return this.head.next === this.tail ? null : this.head.next;
    }

    public put(key: string, value: number): void {
        if (this.map.has(key)) {
            // Key exists: Update value and move to head (MRU)
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToHead(node);
            return;
        }

        // New key
        if (this.map.size >= this.capacity) {
            // Evict LRU
            const lruNode = this.getLRU();
            if (lruNode) {
                this.removeNode(lruNode);
                this.map.delete(lruNode.key);
            }
        }

        const newNode = new this.Node(key, value);
        this.map.set(key, newNode);
        this.moveToHead(newNode);
    }

    public get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        // Successful GET makes it MRU
        this.moveToHead(node);
        return node.value;
    }

    public delete(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.removeNode(node);
            this.map.delete(key);
        }
    }

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


function solve() {
    try {
        const input = fs.readFileSync(0, "utf8").trim().split('\n');
        if (input.length === 0 || input[0] === "") return;

        // First line: C N
        const [C, N] = input[0].split(/\s+/).map(Number);
        const cache = new LRUCache(C);

        const getResults: number[] = [];
        const operations = input.slice(1, N + 1);

        for (const opLine of operations) {
            const parts = opLine.trim().split(/\s+/);
            const command = parts[0];
            const key = parts.length > 1 ? parts[1] : "";
            
            if (command === 'PUT') {
                const value = parseInt(parts[2]);
                cache.put(key, value);
            } else if (command === 'GET') {
                const result = cache.get(key);
                getResults.push(result);
            } else if (command === 'DEL') {
                cache.delete(key);
            }
        }

        // Output 1: GET results
        if (getResults.length === 0) {
            console.log("EMPTY");
        } else {
            console.log(getResults.join(' '));
        }

        // Output 2: Remaining keys (MRU to LRU)
        const remainingKeys = cache.getKeysInOrder();
        if (remainingKeys.length === 0) {
            console.log("EMPTY");
        } else {
            console.log(remainingKeys.join(' '));
        }

    } catch (e) {
        // Handle potential errors gracefully in a real environment, 
        // but for competitive programming context, we assume valid input structure.
    }
}

solve();
