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
        this.map = new Map();
        this.head = new ListNode('', 0);
        this.tail = new ListNode('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private detach(node: ListNode) {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private attachToHead(node: ListNode) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) return -1;
        this.detach(node);
        this.attachToHead(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const existingNode = this.map.get(key);
        if (existingNode) {
            existingNode.value = value;
            this.detach(existingNode);
            this.attachToHead(existingNode);
        } else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail.prev!;
                if (lru !== this.head) {
                    this.map.delete(lru.key);
                    this.detach(lru);
                }
            }
            const newNode = new ListNode(key, value);
            this.map.set(key, newNode);
            this.attachToHead(newNode);
        }
    }

    delete(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.detach(node);
            this.map.delete(key);
        }
    }

    getKeysOrdered(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            if (current) {
                keys.push(current.key);
                current = current.next;
            } else {
                break;
            }
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
        const line = lines[i];
        if (!line) continue;
        const parts = line.trim().split(/\s+/);
        const cmd = parts[0];

        if (cmd === 'PUT') {
            const key = parts[1];
            const val = parseInt(parts[2]);
            cache.put(key, val);
        } else if (cmd === 'GET') {
            const key = parts[1];
            getResults.push(cache.get(key));
        } else if (cmd === 'DEL') {
            const key = parts[1];
            cache.delete(key);
        }
    }

    process.stdout.write((getResults.length > 0 ? getResults.join(' ') : "EMPTY") + "\n");
    const remainingKeys = cache.getKeysOrdered();
    process.stdout.write((remainingKeys.length > 0 ? remainingKeys.join(' ') : "EMPTY") + "\n");
}

solve();
