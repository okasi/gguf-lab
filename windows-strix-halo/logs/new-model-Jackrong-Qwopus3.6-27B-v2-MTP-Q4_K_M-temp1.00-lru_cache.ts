import * as fs from 'fs';

class LRUCache {
    private capacity: number;
    private map: Map<string, Node>;
    private head: Node;
    private tail: Node;
    private size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        // Sentinel nodes
        this.head = new Node(null, null);
        this.tail = new Node(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    private moveToHead(node: Node): void {
        // Remove node from its current position
        this.removeFromList(node);
        // Insert at head
        this.insertBefore(this.head, node);
    }

    private removeFromList(node: Node): void {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        // optional: detach node
        node.prev = null;
        node.next = null;
    }

    private insertBefore(target: Node, node: Node): void {
        // Insert node before target
        const prev = target.prev;
        prev.next = node;
        node.prev = prev;
        node.next = target;
        target.prev = node;
    }

    get(key: string): number | -1 {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        // Move to head (most recent)
        this.moveToHead(node);
        return node.value;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            // Update existing
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToHead(node);
            return;
        }

        // Insert new
        const newNode = new Node(key, value);
        this.insertBefore(this.head, newNode);
        this.map.set(key, newNode);
        this.size++;

        // Evict if over capacity
        if (this.size > this.capacity) {
            const lru = this.tail.prev!;
            this.removeFromList(lru);
            this.map.delete(lru.key!);
            this.size--;
        }
    }

    del(key: string): void {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key)!;
        this.removeFromList(node);
        this.map.delete(key);
        this.size--;
    }

    getKeysMRUtoLRU(): string[] {
        const result: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            result.push(current.key!);
            current = current.next;
        }
        return result;
    }
}

class Node {
    key: string | null;
    value: number | null;
    prev: Node | null;
    next: Node | null;

    constructor(key: string | null, value: number | null) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');
    if (lines.length < 1) return;

    const firstLine = lines[0].trim();
    const parts = firstLine.split(/\s+/);
    const C = parseInt(parts[0], 10);
    const N = parseInt(parts[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        const tokens = line.split(/\s+/);
        const command = tokens[0];
        if (command === 'PUT') {
            const key = tokens[1];
            const value = parseInt(tokens[2], 10);
            cache.put(key, value);
        } else if (command === 'GET') {
            const key = tokens[1];
            const val = cache.get(key);
            getResults.push(val);
        } else if (command === 'DEL') {
            const key = tokens[1];
            cache.del(key);
        }
    }

    // Output first line
    if (getResults.length === 0) {
        process.stdout.write('EMPTY\n');
    } else {
        process.stdout.write(getResults.join(' ') + '\n');
    }

    // Output second line
    const keys = cache.getKeysMRUtoLRU();
    if (keys.length === 0) {
        process.stdout.write('EMPTY\n');
    } else {
        process.stdout.write(keys.join(' ') + '\n');
    }
}

main();
