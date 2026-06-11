import * as fs from 'fs';

interface CacheEntry {
    key: string;
    value: number;
}

class LRUCache {
    private capacity: number;
    // Map for O(1) lookup
    private cacheMap: Map<string, CacheEntry>;
    // Doubly linked list structure for O(1) ordering updates
    private nodes: Map<string, { prev: { key: string } | null, next: { key: string } | null }>;
    private head: { key: string } | null = null; // Dummy head
    private tail: { key: string } | null = null; // Dummy tail

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cacheMap = new Map<string, CacheEntry>();
        this.nodes = new Map<string, { prev: { key: string } | null, next: { key: string } | null }>();

        // Initialize dummy head and tail
        const dummyHead = { key: "HEAD" };
        const dummyTail = { key: "TAIL" };
        this.head = dummyHead;
        this.tail = dummyTail;
        dummyHead.next = dummyTail;
        dummyTail.prev = dummyHead;
    }

    private removeNode(key: string): void {
        const nodeInfo = this.nodes.get(key);
        if (!nodeInfo) return;

        const prevNode = nodeInfo.prev as { key: string };
        const nextNode = nodeInfo.next as { key: string };

        prevNode.next = nextNode;
        nextNode.prev = prevNode;

        this.nodes.delete(key);
    }

    private moveToHead(key: string): void {
        const nodeInfo = this.nodes.get(key);
        if (!nodeInfo) return;

        this.removeNode(key);

        // Insert right after dummy head (MRU position)
        const newNode = { key: key };
        const headNode = this.head as { key: string };

        newNode.prev = headNode;
        newNode.next = headNode.next;

        headNode.next.prev = newNode;
        headNode.next = newNode;
        this.nodes.set(key, { prev: headNode, next: newNode.next });
    }

    private insertAtHead(key: string, value: number): void {
        const newNode = { key: key };
        const headNode = this.head as { key: string };

        newNode.prev = headNode;
        newNode.next = headNode.next;

        headNode.next.prev = newNode;
        headNode.next = newNode;
        this.nodes.set(key, { prev: headNode, next: newNode.next });
    }

    private evictLRU(): string | undefined {
        // The node before the dummy tail is the LRU
        const lruNode = this.tail!.prev as { key: string };
        const lruKey = lruNode.key;

        this.removeNode(lruKey);
        this.cacheMap.delete(lruKey);
        return lruKey;
    }

    public put(key: string, value: number): void {
        if (this.cacheMap.has(key)) {
            // Update existing key and move to head
            const entry = this.cacheMap.get(key)!;
            this.cacheMap.set(key, { key, value });
            this.moveToHead(key);
        } else {
            // New insertion
            if (this.cacheMap.size >= this.capacity) {
                this.evictLRU();
            }
            
            this.cacheMap.set(key, { key, value });
            this.insertAtHead(key, value);
        }
    }

    public get(key: string): number {
        if (!this.cacheMap.has(key)) {
            return -1;
        }
        const entry = this.cacheMap.get(key)!;
        // Access makes it MRU
        this.moveToHead(key);
        return entry.value;
    }

    public del(key: string): void {
        if (this.cacheMap.has(key)) {
            this.removeNode(key);
            this.cacheMap.delete(key);
        }
    }

    public getKeysInOrder(): string[] {
        const keys: string[] = [];
        let current = this.head!.next as { key: string };
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next as { key: string };
        }
        return keys;
    }
}

function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0 || input[0] === "") return;

    const [CStr, NStr] = input[0].split(' ').map(s => s.trim()).filter(s => s.length > 0);
    const C = parseInt(CStr);
    const N = parseInt(NStr);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = input[i].trim();
        if (!line) continue;

        const parts = line.split(/\s+/).filter(s => s.length > 0);
        const command = parts[0];
        const key = parts[1];
        
        if (command === 'PUT') {
            const value = parseInt(parts[2]);
            cache.put(key, value);
        } else if (command === 'GET') {
            const result = cache.get(key);
            getResults.push(result);
        } else if (command === 'DEL') {
            cache.del(key);
        }
    }

    // Output 1: GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(' '));
    }

    // Output 2: Remaining keys in order (MRU to LRU)
    const orderedKeys = cache.getKeysInOrder();
    if (orderedKeys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(orderedKeys.join(' '));
    }
}

solve();
