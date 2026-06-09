import fs from 'fs';

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
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    addNodeToHead(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    moveToHead(node: Node): void {
        this.removeNode(node);
        this.addNodeToHead(node);
    }

    popTailNode(): Node | null {
        const node = this.tail.prev!;
        if (node === this.head) return null;
        this.removeNode(node);
        return node;
    }

    get(key: string): number | null {
        const node = this.map.get(key);
        if (!node) return null;
        this.moveToHead(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToHead(node);
        } else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addNodeToHead(newNode);
            this.size++;
            if (this.size > this.capacity) {
                const tailNode = this.popTailNode();
                if (tailNode) {
                    this.map.delete(tailNode.key);
                    this.size--;
                }
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
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next!;
        }
        return keys;
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split(/\r?\n/);
const firstLineParts = lines[0].split(/\s+/).map(Number);
const C = firstLineParts[0];
const N = firstLineParts[1];

const cache = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(/\s+/);
    const cmd = parts[0];
    if (cmd === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    } else if (cmd === 'GET') {
        const key = parts[1];
        const val = cache.get(key);
        getResults.push(val === null ? -1 : val);
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

const remainingKeys = cache.getAllKeys();
if (remainingKeys.length === 0) {
    console.log('EMPTY');
} else {
    console.log(remainingKeys.join(' '));
}
