import * as fs from 'fs';

class ListNode {
    constructor(
        public key: string,
        public value: number,
        public prev: ListNode | null = null,
        public next: ListNode | null = null
    ) {}
}

class LRUCache {
    private capacity: number;
    private map: Map<string, ListNode>;
    private head: ListNode;
    private tail: ListNode;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map<string, ListNode>();
        this.head = new ListNode("", 0);
        this.tail = new ListNode("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private detach(node: ListNode) {
        const prev = node.prev;
        const next = node.next;
        if (prev) prev.next = next;
        if (next) next.prev = prev;
    }

    private attachToFront(node: ListNode) {
        node.next = this.head.next;
        node.prev = this.head;
        if (this.head.next) this.head.next.prev = node;
        this.head.next = node;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) return -1;
        this.detach(node);
        this.attachToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const existingNode = this.map.get(key);
        if (existingNode) {
            existingNode.value = value;
            this.detach(existingNode);
            this.attachToFront(existingNode);
        } else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail.prev!;
                this.detach(lru);
                this.map.delete(lru.key);
            }
            const newNode = new ListNode(key, value);
            this.map.set(key, newNode);
            this.attachToFront(newNode);
        }
    }

    delete(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.detach(node);
            this.map.delete(key);
        }
    }

    getOrderedKeys(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current !== this.tail && current !== null) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }

    isEmpty(): boolean {
        return this.map.size === 0;
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split(/\r?\n/);
    if (lines.length === 0) return;

    const firstLine = lines[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;
    
    const C = parseInt(firstLine[0]);
    const N = parseInt(firstLine[1]);
    
    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;
        
        const parts = line.split(/\s+/);
        const command = parts[0];

        if (command === 'PUT') {
            cache.put(parts[1], parseInt(parts[2]));
        } else if (command === 'GET') {
            getResults.push(cache.get(parts[1]));
        } else if (command === 'DEL') {
            cache.delete(parts[1]);
        }
    }

    process.stdout.write(getResults.length > 0 ? getResults.join(' ') + '\n' : 'EMPTY\n');
    const remainingKeys = cache.getOrderedKeys();
    process.stdout.write(remainingKeys.length > 0 ? remainingKeys.join(' ') + '\n' : 'EMPTY\n');
}

solve();
