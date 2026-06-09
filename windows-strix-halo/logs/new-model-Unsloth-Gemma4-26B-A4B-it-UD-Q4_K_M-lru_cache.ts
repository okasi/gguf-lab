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
    private head: Node | null = null;
    private tail: Node | null = null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
    }

    private remove(node: Node) {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }
        node.prev = null;
        node.next = null;
    }

    private addToHead(node: Node) {
        node.next = this.head;
        node.prev = null;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }

    private moveToHead(node: Node) {
        if (node === this.head) return;
        this.remove(node);
        this.addToHead(node);
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (node === undefined) return -1;
        this.moveToHead(node);
        return node.value;
    }

    put(key: string, value: number) {
        const node = this.map.get(key);
        if (node !== undefined) {
            node.value = value;
            this.moveToHead(node);
        } else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail;
                if (lru) {
                    this.map.delete(lru.key);
                    this.remove(lru);
                }
            }
            const newNode = new Node(key, value);
            this.addToHead(newNode);
            this.map.set(key, newNode);
        }
    }

    delete(key: string) {
        const node = this.map.get(key);
        if (node !== undefined) {
            this.remove(node);
            this.map.delete(key);
        }
    }

    getRemainingKeys(): string[] {
        const keys: string[] = [];
        let curr = this.head;
        while (curr) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}

function solve() {
    let input = "";
    try {
        input = fs.readFileSync(0, "utf8");
    } catch (e) {
        return;
    }
    if (!input) return;
    const tokens = input.trim().split(/\s+/);
    if (tokens.length < 2) return;

    let idx = 0;
    const C = parseInt(tokens[idx++]);
    const N = parseInt(tokens[idx++]);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 0; i < N; i++) {
        if (idx >= tokens.length) break;
        const op = tokens[idx++];
        if (op === "PUT") {
            const key = tokens[idx++];
            const value = parseInt(tokens[idx++]);
            cache.put(key, value);
        } else if (op === "GET") {
            const key = tokens[idx++];
            getResults.push(cache.get(key));
        } else if (op === "DEL") {
            const key = tokens[idx++];
            cache.delete(key);
        }
    }

    process.stdout.write(getResults.length > 0 ? getResults.join(" ") + "\n" : "EMPTY\n");
    const remaining = cache.getRemainingKeys();
    process.stdout.write(remaining.length > 0 ? remaining.join(" ") + "\n" : "EMPTY\n");
}

solve();
