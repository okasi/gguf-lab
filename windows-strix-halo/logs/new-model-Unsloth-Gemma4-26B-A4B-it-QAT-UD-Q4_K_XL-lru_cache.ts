import * as fs from 'fs';

class ListNode {
    constructor(
        public key: string,
        public value: number,
        public prev: ListNode | null = null,
        public next: ListNode | null = null
    ) {}
}

class LRUCache {
    private capacity: number;
    private map: Map<string, ListNode>;
    private head: ListNode;
    private tail: ListNode;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new ListNode("head_sentinel", 0);
        this.tail = new ListNode("tail_sentinel", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private remove(node: ListNode): void {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private addToHead(node: ListNode): void {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    get(key: string): number {
        if (!this.map.has(key)) return -1;
        const node = this.map.get(key)!;
        this.remove(node);
        this.addToHead(node);
        return node.value;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.remove(node);
            this.addToHead(node);
        } else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail.prev!;
                this.map.delete(lru.key);
                this.remove(lru);
            }
            const newNode = new ListNode(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
        }
    }

    del(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.remove(node);
            this.map.delete(key);
        }
    }

    getRemainingKeys(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            if (current !== this.head && current !== this.tail) {
                keys.push(current.key);
            }
            current = current.next!;
        }
        return keys;
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
            getResults.push(cache.get(key));
        } else if (op === "DEL") {
            const key = parts[1];
            cache.del(key);
        }
    }

    if (getResults.length === 0) {
        process.stdout.write("EMPTY\n");
    } else {
        process.stdout.write(getResults.join(" ") + "\n");
    }

    const remainingKeys = cache.getRemainingKeys();
    if (remainingKeys.length === 0) {
        process.stdout.write("EMPTY\n");
    } else {
        process.stdout.write(remainingKeys.join(" ") + "\n");
    }
}

solve();
