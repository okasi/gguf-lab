import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split(/\r?\n/);
const firstLine = lines[0].trim().split(/\s+/);
const C = parseInt(firstLine[0], 10);
const N = parseInt(firstLine[1], 10);

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
    size: number;
    map: Map<string, Node>;
    head: Node;
    tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    addFront(node: Node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    removeNode(node: Node) {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
        node.prev = null;
        node.next = null;
    }

    moveToFront(node: Node) {
        this.removeNode(node);
        this.addFront(node);
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this.moveToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToFront(node);
        } else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this.addFront(node);
            this.size++;
            if (this.size > this.capacity) {
                const evictNode = this.tail.prev!;
                this.removeNode(evictNode);
                this.map.delete(evictNode.key);
                this.size--;
            }
        }
    }

    del(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeysMostRecentToLeast(): string[] {
        const keys: string[] = [];
        let cur = this.head.next;
        while (cur !== this.tail) {
            keys.push(cur.key);
            cur = cur.next!;
        }
        return keys;
    }
}

const cache = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    const command = parts[0];
    if (command === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    } else if (command === 'GET') {
        const key = parts[1];
        const result = cache.get(key);
        getResults.push(result);
    } else if (command === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}

if (getResults.length === 0) {
    console.log('EMPTY');
} else {
    console.log(getResults.join(' '));
}

const keys = cache.getKeysMostRecentToLeast();
if (keys.length === 0) {
    console.log('EMPTY');
} else {
    console.log(keys.join(' '));
}
