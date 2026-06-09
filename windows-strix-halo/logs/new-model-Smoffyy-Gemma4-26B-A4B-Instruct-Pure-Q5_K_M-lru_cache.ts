import * as fs from 'fs';

class ListNode {
    key: string;
    value: number;
    prev: ListNode | null = null;
    next: ListNode | null = null;
    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
    }
}

class LRUCache {
    private capacity: number;
    private map: Map<string, ListNode>;
    private head: ListNode;
    private tail: ListNode;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new ListNode("", 0);
        this.tail = new ListNode("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private removeNode(node: ListNode) {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private addToHead(node: ListNode) {
        const next = this.head.next!;
        this.head.next = node;
        node.prev = this.head;
        node.next = next;
        next.prev = node;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) return -1;
        this.removeNode(node);
        this.addToHead(node);
        return node.value;
    }

    put(key: string, value: number) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.removeNode(node);
            this.addToHead(node);
        } else {
            const newNode = new ListNode(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
            if (this.map.size > this.capacity) {
                const lru = this.tail.prev!;
                this.removeNode(lru);
                this.map.delete(lru.key);
            }
        }
    }

    del(key: string) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
        }
    }

    getOrderedKeys(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            if (curr) {
                keys.push(curr.key);
                curr = curr.next!;
            } else {
                break;
            }
        }
        return keys;
    }
}

function solve() {
    let input = '';
    try {
        input = fs.readFileSync(0, "utf8");
    } catch (e) {
        return;
    }
    const tokens = input.match(/\S+/g);
    if (!tokens || tokens.length < 2) return;

    let idx = 0;
    const C = parseInt(tokens[idx++]);
    const N = parseInt(tokens[idx++]);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 0; i < N; i++) {
        if (idx >= tokens.length) break;
        const op = tokens[idx++];
        if (op === 'PUT') {
            const key = tokens[idx++];
            const val = parseInt(tokens[idx++]);
            cache.put(key, val);
        } else if (op === 'GET') {
            const key = tokens[idx++];
            getResults.push(cache.get(key));
        } else if (op === 'DEL') {
            const key = tokens[idx++];
            cache.del(key);
        }
    }

    if (getResults.length === 0) {
        process.stdout.write("EMPTY\n");
    } else {
        process.stdout.write(getResults.join(" ") + "\n");
    }

    const remainingKeys = cache.getOrderedKeys();
    if (remainingKeys.length === 0) {
        process.stdout.write("EMPTY\n");
    } else {
        process.stdout.write(remainingKeys.join(" ") + "\n");
    }
}

solve();
