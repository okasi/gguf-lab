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
    private map: Map<string, Node>;
    private head: Node;
    private tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        // Dummy head and tail for easier manipulation
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private addToFront(node: Node): void {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    private removeNode(node: Node): void {
        const prev = node.prev;
        const next = node.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
    }

    private moveToFront(node: Node): void {
        this.removeNode(node);
        this.addToFront(node);
    }

    private removeTail(): Node | null {
        if (this.tail.prev && this.tail.prev !== this.head) {
            const node = this.tail.prev;
            this.removeNode(node);
            return node;
        }
        return null;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (node) {
            this.moveToFront(node);
            return node.value;
        }
        return -1;
    }

    put(key: string, value: number): void {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToFront(existing);
        } else {
            if (this.size === this.capacity) {
                const tailNode = this.removeTail();
                if (tailNode) {
                    this.map.delete(tailNode.key);
                    this.size--;
                }
            }
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToFront(newNode);
            this.size++;
        }
    }

    delete(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeysInOrder(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n').filter(line => line.length > 0);

const firstLine = lines[0].split(' ');
const capacity = parseInt(firstLine[0]);
const numOperations = parseInt(firstLine[1]);

const cache = new LRUCache(capacity);
const getResults: number[] = [];

for (let i = 1; i <= numOperations; i++) {
    const line = lines[i];
    const parts = line.split(' ');
    const operation = parts[0];
    const key = parts[1];
    const value = parts[2] ? parseInt(parts[2]) : 0;

    switch (operation) {
        case 'PUT':
            cache.put(key, value);
            break;
        case 'GET':
            getResults.push(cache.get(key));
            break;
        case 'DEL':
            cache.delete(key);
            break;
    }
}

if (getResults.length === 0) {
    console.log('EMPTY');
} else {
    console.log(getResults.join(' '));
}

const keys = cache.getKeysInOrder();
if (keys.length === 0) {
    console.log('EMPTY');
} else {
    console.log(keys.join(' '));
}
