import * as fs from 'fs';

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

class LRUCache {
    capacity: number;
    map: Map<string, Node>;
    head: Node;
    tail: Node;
    size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    removeNode(node: Node): void {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    addNodeToFront(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    moveToFront(node: Node): void {
        this.removeNode(node);
        this.addNodeToFront(node);
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToFront(node);
        } else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addNodeToFront(newNode);
            this.size++;
            if (this.size > this.capacity) {
                const lru = this.tail.prev;
                if (lru !== this.head) {
                    this.removeNode(lru);
                    this.map.delete(lru.key);
                }
                this.size--;
            }
        }
    }

    del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getAllKeys(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}

function main(): void {
    const data = fs.readFileSync(0, 'utf8');
    const lines = data.trim().split(/\r?\n/);
    if (lines.length === 0) return;

    const firstLineParts = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLineParts[0], 10);
    const N = parseInt(firstLineParts[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        if (cmd === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (cmd === 'GET') {
            const key = parts[1];
            const val = cache.get(key);
            getResults.push(val);
        } else if (cmd === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }

    if (getResults.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(getResults.join(' '));
    }

    const keys = cache.getAllKeys();
    if (keys.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(keys.join(' '));
    }
}

main();
