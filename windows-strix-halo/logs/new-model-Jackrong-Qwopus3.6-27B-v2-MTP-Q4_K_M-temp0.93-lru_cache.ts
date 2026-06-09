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
    capacity: number;
    size: number;
    head: Node;
    tail: Node;
    map: Map<string, Node>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.map = new Map();
    }

    private remove(node: Node): void {
        node.prev!.next = node.next!;
        node.next!.prev = node.prev!;
    }

    private insertAfterHead(node: Node): void {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    private moveToFront(node: Node): void {
        this.remove(node);
        this.insertAfterHead(node);
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToFront(node);
        } else {
            if (this.size === this.capacity) {
                const lru = this.tail.prev!;
                this.remove(lru);
                this.map.delete(lru.key);
                this.size--;
            }
            const node = new Node(key, value);
            this.insertAfterHead(node);
            this.map.set(key, node);
            this.size++;
        }
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this.moveToFront(node);
        return node.value;
    }

    del(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.remove(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeys(): string[] {
        const keys: string[] = [];
        let cur = this.head.next!;
        while (cur !== this.tail) {
            keys.push(cur.key);
            cur = cur.next!;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.split('\n');
    const firstLine = lines[0].trim();
    const [C, N] = firstLine.split(/\s+/).map(Number);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        if (!line) continue; // skip empty lines if any
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        const key = parts[1];
        if (cmd === 'PUT') {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (cmd === 'GET') {
            const val = cache.get(key);
            getResults.push(val);
        } else if (cmd === 'DEL') {
            cache.del(key);
        }
    }

    const out1 = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const keys = cache.getKeys();
    const out2 = keys.length > 0 ? keys.join(' ') : 'EMPTY';
    fs.writeFileSync(1, out1 + '\n' + out2 + '\n');
}

main();
