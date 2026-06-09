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
    private cache: Map<string, Node>;
    private head: Node;
    private tail: Node;
    private size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    private moveToFront(node: Node): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
        const nextNode = this.head.next;
        node.next = nextNode;
        node.prev = this.head;
        this.head.next = node;
        nextNode.prev = node;
    }

    private removeNode(node: Node): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }

    private addFront(node: Node): void {
        const nextNode = this.head.next;
        node.next = nextNode;
        node.prev = this.head;
        this.head.next = node;
        nextNode.prev = node;
    }

    private removeLast(): Node | null {
        if (this.size === 0) return null;
        const node = this.tail.prev!;
        this.removeNode(node);
        this.size--;
        return node;
    }

    get(key: string): number {
        if (!this.cache.has(key)) return -1;
        const node = this.cache.get(key)!;
        this.moveToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        if (this.cache.has(key)) {
            const node = this.cache.get(key)!;
            node.value = value;
            this.moveToFront(node);
        } else {
            const node = new Node(key, value);
            this.cache.set(key, node);
            this.addFront(node);
            this.size++;
            if (this.size > this.capacity) {
                const removed = this.removeLast();
                if (removed) {
                    this.cache.delete(removed.key);
                }
            }
        }
    }

    del(key: string): void {
        if (this.cache.has(key)) {
            const node = this.cache.get(key)!;
            this.removeNode(node);
            this.cache.delete(key);
            this.size--;
        }
    }

    getAllKeys(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next!;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) return;
    const lines = input.split(/\r?\n/);
    const firstLineParts = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLineParts[0], 10);
    const N = parseInt(firstLineParts[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        const key = parts[1];
        if (cmd === 'GET') {
            const val = cache.get(key);
            getResults.push(val);
        } else if (cmd === 'PUT') {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (cmd === 'DEL') {
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
