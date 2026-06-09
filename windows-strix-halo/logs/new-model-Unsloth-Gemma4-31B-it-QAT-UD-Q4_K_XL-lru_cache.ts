import * as fs from 'fs';

class Node {
    constructor(public key: string, public value: number) {}
    prev: Node | null = null;
    next: Node | null = null;
}

class LRUCache {
    private capacity: number;
    private map: Map<string, Node>;
    private head: Node | null = null;
    private tail: Node | null = null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
    }

    private remove(node: Node) {
        if (node.prev) node.prev.next = node.next;
        else this.head = node.next;

        if (node.next) node.next.prev = node.prev;
        else this.tail = node.prev;

        node.next = null;
        node.prev = null;
    }

    private setMostRecent(node: Node) {
        if (!this.head) {
            this.head = this.tail = node;
        } else {
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
            if (!this.tail) this.tail = node;
        }
    }

    put(key: string, value: number) {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.remove(node);
            this.setMostRecent(node);
        } else {
            if (this.map.size >= this.capacity) {
                if (this.tail) {
                    this.map.delete(this.tail.key);
                    this.remove(this.tail!);
                }
            }
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.setMostRecent(newNode);
        }
    }

    get(key: string): number {
        if (!this.map.has(key)) return -1;
        const node = this.map.get(key)!;
        this.remove(node);
        this.setMostRecent(node);
        return node.value;
    }

    del(key: string) {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.remove(node);
            this.map.delete(key);
        }
    }

    getKeys(): string[] {
        const keys = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    let ptr = 0;
    if (ptr >= input.length) return;

    const C = parseInt(input[ptr++]);
    const N = parseInt(input[ptr++]);
    const cache = new LRUCache(C);
    const results: number[] = [];

    for (let i = 0; i < N; i++) {
        const op = input[ptr++];
        if (op === 'PUT') {
            const key = input[ptr++];
            const val = parseInt(input[ptr++]);
            cache.put(key, val);
        } else if (op === 'GET') {
            const key = input[ptr++];
            results.push(cache.get(key));
        } else if (op === 'DEL') {
            const key = input[ptr++];
            cache.del(key);
        }
    }

    process.stdout.write((results.length > 0 ? results.join(' ') : 'EMPTY') + '\n');
    const keys = cache.getKeys();
    process.stdout.write((keys.length > 0 ? keys.join(' ') : 'EMPTY') + '\n');
}

solve();
