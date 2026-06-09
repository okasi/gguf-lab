import * as fs from 'fs';

interface Node {
    key: string;
    value: number;
    prev: Node | null;
    next: Node | null;
}

class LRUCache {
    private capacity: number;
    private size: number = 0;
    private cache: Map<string, Node>;
    private head: Node | null = null;
    private tail: Node | null = null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    private removeNode(node: Node) {
        if (node.prev) node.prev.next = node.next;
        else this.head = node.next;

        if (node.next) node.next.prev = node.prev;
        else this.tail = node.prev;
    }

    private moveToHead(node: Node) {
        this.removeNode(node);
        this.addToHead(node);
    }

    private addToHead(node: Node) {
        node.next = this.head;
        node.prev = null;
        if (this.head) this.head.prev = node;
        this    .head = node;
        if (!this.tail) this.tail = node;
    }

    get(key: string): number {
        const node = this.cache.get(key);
        if (!node) return -1;
        this.moveToHead(node);
        return node.value;
    }

    put(key: string, value: number) {
        const existing = this.cache.get(key);
        if (existing) {
            existing.value = value;
            this.moveToHead(existing);
            return;
        }

        if (this.size === this.capacity) {
            if (this.tail) {
                this.cache.delete(this.tail.key);
                this.removeNode(this.tail);
                this.size--;
            }
        }

        const newNode: Node = { key, value, prev: null, next: this.head };
        if (this.head) this.head.prev = newNode;
        this.head = newNode;
        if (!this.tail) this.tail = newNode;
        this.cache.set(key, newNode);
        this.size++;
    }

    delete(key: string) {
        const node = this.cache.get(key);
        if (node) {
            this.removeNode(node);
            this.cache.delete(key);
            this.size--;
        }
    }

    getOrderedKeys(): string[] {
        const result: string[] = [];
        let current = this.head;
        while (current) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split(/\r?\n/);
    if (lines.length === 0 || lines[0].trim() === "") return;

    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0]);
    const N = parseInt(firstLine[1]);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        if (!lines[i]) continue;
        const parts = lines[i].trim().split(/\s+/);
        const op = parts[0];

        if (op === "PUT") {
            const key = parts[1];
            const value = parseInt(parts[2]);
            cache.put(key, value);
        } else if (op === "GET") {
            const key = parts[1];
            const val = cache.get(key);
            getResults.push(val);
        } else if (op === "DEL") {
            const key = parts[1];
            cache.delete(key);
        }
    }

    process.stdout.write((getResults.length > 0 ? getResults.join(" ") : "EMPTY") + "\n");
    const remainingKeys = cache.getOrderedKeys();
    process.stdout.write((remainingKeys.length > 0 ? remainingKeys.join(" ") : "EMPTY") + "\n");
}

solve();
