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
        if (this.tail.prev) {
            const node = this.tail.prev;
            this.removeNode(node);
            return node;
        }
        return null;
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
            return;
        }
        if (this.size >= this.capacity) {
            const tailNode = this.removeTail();
            if (tailNode) {
                this.map.delete(tailNode.key);
                this.size--;
            }
        }
        const newNode = new Node(key, value);
        this.addToFront(newNode);
        this.map.set(key, newNode);
        this.size++;
    }

    delete(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
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
const getResults: string[] = [];

for (let i = 1; i <= numOperations; i++) {
    const parts = lines[i].split(' ');
    const operation = parts[0];
    const key = parts[1];
    const value = parts[2];

    switch (operation) {
        case 'PUT':
            cache.put(key, parseInt(value));
            break;
        case 'GET':
            const result = cache.get(key);
            getResults.push(result.toString());
            break;
        case 'DEL':
            cache.delete(key);
            break;
    }
}

// Output GET results
if (getResults.length === 0) {
    console.log('EMPTY');
} else {
    console.log(getResults.join(' '));
}

// Output remaining keys
const keys = cache.getKeysInOrder();
if (keys.length === 0) {
    console.log('EMPTY');
} else {
    console.log(keys.join(' '));
}
