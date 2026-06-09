import * as fs from 'fs';

class Node {
    key: string;
    value: number;
    prev: Node | null = null;
    next: Node | null = null;

    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
    }
}

class LRUCache {
    private capacity: number;
    private map: Map<string, Node>;
    private head: Node;
    private tail: Node;
    private size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.size = 0;

        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private removeFromNode(node: Node): void {
        const prev = node.prev;
        const next = node.next;
        if (prev) prev.next = next;
        if (next) next.prev = prev;
        node.prev = null;
        node.next = null;
    }

    private addNodeToFront(node: Node): void {
        const next = this.head.next;
        this.head.next = node;
        node.prev = this.head;
        node.next = next;
        if (next) next.prev = node;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.removeFromNode(node);
            this.addNodeToFront(node);
        } else {
            if (this.size === this.capacity) {
                const lru = this.tail.prev;
                if (lru && lru !== this.head) {
                    this.map.delete(lru.key);
                    this.removeFromNode(lru);
                    this.size--;
                }
            }
            const node = new Node(key, value);
            this.map.set(key, node);
            this.addNodeToFront(node);
            this.size++;
        }
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this.removeFromNode(node);
        this.addNodeToFront(node);
        return node.value;
    }

    delete(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.removeFromNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeys(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split('\n');
const firstLine = lines[0].split(' ');
const capacity = parseInt(firstLine[0], 10);
const n = parseInt(firstLine[1], 10);

const cache = new LRUCache(capacity);
const getResults: number[] = [];

for (let i = 1; i <= n; i++) {
    const line = lines[i].trim();
    const parts = line.split(' ');
    const operation = parts[0];
    const key = parts[1];

    switch (operation) {
        case 'PUT':
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
            break;
        case 'GET':
            const result = cache.get(key);
            getResults.push(result);
            break;
        case 'DEL':
            cache.delete(key);
            break;
    }
}

console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
const remainingKeys = cache.getKeys();
console.log(remainingKeys.length > 0 ? remainingKeys.join(' ') : 'EMPTY');
