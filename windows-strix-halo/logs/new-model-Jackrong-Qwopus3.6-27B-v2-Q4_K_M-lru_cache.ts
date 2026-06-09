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
    private size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    private removeNode(node: Node): void {
        const prev = node.prev;
        const next = node.next;
        if (prev) prev.next = next;
        if (next) next.prev = prev;
    }

    private addToFront(node: Node): void {
        const first = this.head.next;
        node.next = first;
        node.prev = this.head;
        this.head.next = node;
        first.prev = node;
    }

    private moveToFront(node: Node): void {
        this.removeNode(node);
        this.addToFront(node);
    }

    public get(key: string): number {
        const node = this.map.get(key);
        if (!node) return -1;
        this.moveToFront(node);
        return node.value;
    }

    public put(key: string, value: number): void {
        const existingNode = this.map.get(key);
        if (existingNode) {
            existingNode.value = value;
            this.moveToFront(existingNode);
        } else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToFront(newNode);
            this.size++;
            if (this.size > this.capacity) {
                const lruNode = this.tail.prev;
                if (lruNode) {
                    this.removeNode(lruNode);
                    this.map.delete(lruNode.key);
                    this.size--;
                }
            }
        }
    }

    public del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    public getKeysInOrder(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const firstLine = lines[0].trim();
    const [C, N] = firstLine.split(/\s+/).map(Number);

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
            const result = cache.get(key);
            getResults.push(result);
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

    const keys = cache.getKeysInOrder();
    if (keys.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(keys.join(' '));
    }
}

main();
