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
    private map: Map<string, Node>;
    private head: Node;
    private tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map<string, Node>();
        this.head = new Node('', -1);
        this.tail = new Node('', -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.addToHead(node);
    }

    private addToHead(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
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
        node.prev = null;
        node.next = null;
    }

    private removeTail(): Node | null {
        const node = this.tail.prev;
        if (node && node !== this.head) {
            this.removeNode(node);
            return node;
        }
        return null;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToHead(node);
        } else {
            const node = new Node(key, value);
            this.addToHead(node);
            this.map.set(key, node);
            if (this.map.size > this.capacity) {
                const tail = this.removeTail();
                if (tail) {
                    this.map.delete(tail.key);
                }
            }
        }
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this.moveToHead(node);
        return node.value;
    }

    del(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.removeNode(node);
            this.map.delete(key);
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
const lines = input.split('\n');
const firstLine = lines[0].split(' ');
const capacity = parseInt(firstLine[0], 10);
const numOperations = parseInt(firstLine[1], 10);

const cache = new LRUCache(capacity);
const getResults: number[] = [];

for (let i = 1; i <= numOperations; i++) {
    const line = lines[i].trim().split(' ');
    const operation = line[0];
    const key = line[1];
    const value = parseInt(line[2], 10);

    switch (operation) {
        case 'PUT':
            cache.put(key, value);
            break;
        case 'GET':
            const result = cache.get(key);
            getResults.push(result);
            break;
        case 'DEL':
            cache.del(key);
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
