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
    private capacity: number;
    private size: number;
    private cache: Map<string, Node>;
    private head: Node;
    private tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.cache = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private insertAtHead(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    private removeNode(node: Node): void {
        node.prev!.next = node.next!;
        node.next!.prev = node.prev!;
        node.prev = null;
        node.next = null;
    }

    private moveToFront(node: Node): void {
        this.removeNode(node);
        this.insertAtHead(node);
    }

    private removeTail(): Node | null {
        const node = this.tail.prev;
        if (node === this.head) return null;
        this.removeNode(node);
        return node;
    }

    get(key: string): number | null {
        const node = this.cache.get(key);
        if (!node) return null;
        this.moveToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const node = this.cache.get(key);
        if (node) {
            node.value = value;
            this.moveToFront(node);
            return;
        }
        if (this.size >= this.capacity) {
            const removed = this.removeTail();
            if (removed) {
                this.cache.delete(removed.key);
            }
        }
        const newNode = new Node(key, value);
        this.insertAtHead(newNode);
        this.cache.set(key, newNode);
        this.size++;
    }

    del(key: string): void {
        const node = this.cache.get(key);
        if (!node) return;
        this.removeNode(node);
        this.cache.delete(key);
        this.size--;
    }

    getKeysFromMostRecentToLeast(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next!;
        }
        return keys;
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split(/\r?\n/);
const [C, N] = lines[0].split(' ').map(Number);

const lru = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(' ');
    const op = parts[0];
    if (op === 'PUT') {
        const key = parts[1];
        const value = Number(parts[2]);
        lru.put(key, value);
    } else if (op === 'GET') {
        const key = parts[1];
        const res = lru.get(key);
        getResults.push(res !== null ? res : -1);
    } else if (op === 'DEL') {
        const key = parts[1];
        lru.del(key);
    }
}

if (getResults.length === 0) {
    console.log('EMPTY');
} else {
    console.log(getResults.join(' '));
}

const keys = lru.getKeysFromMostRecentToLeast();
if (keys.length === 0) {
    console.log('EMPTY');
} else {
    console.log(keys.join(' '));
}
