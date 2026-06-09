import * as fs from 'fs';

class Node {
    key: string;
    value: number;
    prev: Node | null = null;
    next: Node | null = null;
    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
    }
}

class LRUCache {
    private capacity: number;
    private map: Map<string, Node>;
    private head: Node;
    private tail: Node;
    private size: number;

    constructor(capacity: number) {
        this.capacity = Math.max(1, capacity);
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    private remove(node: Node) {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private addToHead(node: Node) {
        const next = this.head.next!;
        this.head.next = node;
        node.prev = this.head;
        node.next = next;
        next.prev = node;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (node === undefined) return -1;
        this.remove(node);
        this.addToHead(node);
        return node.value;
    }

    put(key: string, value: number) {
        const node = this.map.get(key);
        if (node !== undefined) {
            node.value = value;
            this.remove(node);
            this.addToHead(node);
        } else {
            if (this.size >= this.capacity) {
                const lru = this.tail.prev!;
                if (lru !== this.head) {
                    this.remove(lru);
                    this.map.delete(lru.key);
                    this.size--;
                }
            }
            if (this.size < this.capacity) {
                const newNode = new Node(key, value);
                this.addToHead(newNode);
                this.map.set(key, newNode);
                this.size++;
            }
        }
    }

    del(key: string) {
        const node = this.map.get(key);
        if (node !== undefined) {
            this.remove(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getRemainingKeys(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== undefined && curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.trim().split(/\s+/);
    if (tokens.length < 2) return;

    let idx = 0;
    const C = parseInt(tokens[idx++], 10);
    const N = parseInt(tokens[idx++], 10);
    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 0; i < N; i++) {
        if (idx >= tokens.length) break;
        const op = tokens[idx++];
        if (op === "PUT") {
            const key = tokens[idx++];
            const value = parseInt(tokens[idx++], 10);
            cache.put(key, value);
        } else if (op === "GET") {
            const key = tokens[idx++];
            getResults.push(cache.get(key));
        } else if (op === "DEL") {
            const key = tokens[idx++];
            cache.del(key);
        }
    }

    process.stdout.write(getResults.length > 0 ? getResults.join(" ") + "\n" : "EMPTY\n");
    const keys = cache.getRemainingKeys();
    process.stdout.write(keys.length > 0 ? keys.join(" ") + "\n" : "EMPTY\n");
}

solve();
