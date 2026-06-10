const fs = require('fs');

/**
 * LRUCache implementation using a Map to store key-value pairs and 
 * a Doubly Linked List to maintain the order of usage.
 * Map provides O(1) access, Linked List provides O(1) removal/insertion.
 */
class LRUCache {
    private capacity: number;
    private map: Map<string, ListNode>;
    private head: ListNode; // Most recently used
    private tail: ListNode; // Least recently used

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new ListNode(null, null);
        this.tail = new ListNode(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private remove(node: ListNode) {
        node.prev!.next = node.next!;
        node.next!.prev = node.prev!;
    }

    private addToHead(node: ListNode) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    public get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this.remove(node);
        this.addToHead(node);
        return node.value;
    }

    public put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.remove(node);
            this.addToHead(node);
        } else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail.prev!;
                this.remove(lru);
                this.map.delete(lru.key);
            }
            const newNode = new ListNode(key, value);
            this.addToHead(newNode);
            this.map.set(key, newNode);
        }
    }

    public del(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.remove(node);
            this.map.delete(key);
        }
    }

    public getFinalOrder(): string[] {
        const result: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}

class ListNode {
    constructor(public key: string | null, public value: number | null, public prev: ListNode | null = null, public next: ListNode | null = null) {}
}

function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    let cursor = 0;

    if (input.length < 2) return;
    const capacity = parseInt(input[cursor++]);
    const n = parseInt(input[cursor++]);

    const cache = new LRUCache(capacity);
    const getResults: number[] = [];

    for (let i = 0; i < n; i++) {
        const op = input[cursor++];
        if (op === 'PUT') {
            const key = input[cursor++];
            const value = parseInt(input[cursor++]);
            cache.put(key, value);
        } else if (op === 'GET') {
            const key = input[cursor++];
            getResults.push(cache.get(key));
        } else if (op === 'DEL') {
            const key = input[cursor++];
            cache.del(key);
        }
    }

    if (getResults.length === 0) {
        process.stdout.write("EMPTY\n");
    } else {
        process.stdout.write(getResults.join(" ") + "\n");
    }

    const finalKeys = cache.getFinalOrder();
    if (finalKeys.length === 0) {
        process.stdout.write("EMPTY\n");
    } else {
        process.stdout.write(finalKeys.join(" ") + "\n");
    }
}

solve();
