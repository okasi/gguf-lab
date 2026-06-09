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
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private addToFront(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    private removeNode(node: Node): void {
        const prev = node.prev;
        const next = node.next;
        if (prev !== null && next !== null) {
            prev.next = next;
            next.prev = prev;
        }
    }

    private moveToFront(node: Node): void {
        this.removeNode(node);
        this.addToFront(node);
    }

    private removeLast(): Node {
        const last = this.tail.prev;
        if (last !== null) {
            this.removeNode(last);
        }
        return last;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (node !== undefined) {
            this.moveToFront(node);
            return node.value;
        }
        return -1;
    }

    put(key: string, value: number): void {
        const existingNode = this.map.get(key);
        if (existingNode !== undefined) {
            existingNode.value = value;
            this.moveToFront(existingNode);
        } else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToFront(newNode);
            if (this.map.size > this.capacity) {
                const lastNode = this.removeLast();
                if (lastNode !== null) {
                    this.map.delete(lastNode.key);
                }
            }
        }
    }

    delete(key: string): void {
        const node = this.map.get(key);
        if (node !== undefined) {
            this.removeNode(node);
            this.map.delete(key);
        }
    }

    getOrderedKeys(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current !== null && current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

const input = fs.readFileSync(0, "utf8").trim().split('\n');
const firstLine = input[0].split(' ');
const capacity: number = parseInt(firstLine[0], 10);
const n: number = parseInt(firstLine[1], 10);

const cache = new LRUCache(capacity);
const getResults: string[] = [];

for (let i = 1; i <= n; i++) {
    const line = input[i];
    const parts = line.split(' ');
    const operation = parts[0];
    const key = parts[1];

    if (operation === 'PUT') {
        const value: number = parseInt(parts[2], 10);
        cache.put(key, value);
    } else if (operation === 'GET') {
        const result: number = cache.get(key);
        getResults.push(result.toString());
    } else if (operation === 'DEL') {
        cache.delete(key);
    }
}

if (getResults.length === 0) {
    console.log("EMPTY");
} else {
    console.log(getResults.join(' '));
}

const remainingKeys = cache.getOrderedKeys();
if (remainingKeys.length === 0) {
    console.log("EMPTY");
} else {
    console.log(remainingKeys.join(' '));
}
