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
    private capacity: number;
    private size: number;
    private map: Map<string, Node>;
    private head: Node;
    private tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private addToHead(node: Node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    private removeNode(node: Node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private removeTail(): Node {
        const node = this.tail.prev;
        this.removeNode(node);
        this.map.delete(node.key);
        this.size--;
        return node;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) return -1;

        this.removeNode(node);
        this.addToHead(node);

        return node.value;
    }

    put(key: string, value: number): void {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.removeNode(node);
            this.addToHead(node);
        } else {
            const newNode = new Node(key, value);
            this.addToHead(newNode);
            this.map.set(key, newNode);
            this.size++;

            if (this.size > this.capacity) {
                this.removeTail();
            }
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

    getKeys(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

const input = fs.readFileSync(0, 'utf8');
const lines = input.trim().split('\n');
const [C, N] = lines[0].split(' ').map(Number);

const lru = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i <= lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    const op = parts[0];

    if (op === 'GET') {
        const key = parts[1];
        const result = lru.get(key);
        getResults.push(result);
    } else if (op === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2]);
        lru.put(key, value);
    } else if (op === 'DEL') {
        const key = parts[1];
        lru.delete(key);
    }
}

console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
console.log(lru.getKeys().length > 0 ? lru.getKeys().join(' ') : 'EMPTY');
