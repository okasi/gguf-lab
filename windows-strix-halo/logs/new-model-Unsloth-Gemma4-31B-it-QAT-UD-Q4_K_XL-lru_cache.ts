import * as fs from 'fs';

class Node {
    constructor(public key: string, public value: number) {
        this.prev = null;
        this.next = null;
    }
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
    }

    private setMostRecent(node: Node) {
        node.next = this.head;
        node.prev = null;
        if (this.head) this.head.prev = node;
        this.head = node;
        if (!this.tail) this.tail = node;
    }

    put(key: string, value: number) {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.remove(node);
            this.setMostRecent(node);
        } else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail;
                if (lru) {
                    this.map.delete(lru.key);
                    this.remove(lru);
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
        let curr = this.head;
        while (curr) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.split(/\r?\n/);
    if (lines.length === 0) return;

    const firstLine = lines[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;

    const C = parseInt(firstLine[0]);
    const N = parseInt(firstLine[1]);
    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;
        const parts = line.split(/\s+/);
        const op = parts[0];

        if (op === 'PUT') {
            cache.put(parts[1], parseInt(parts[2]));
        } else if (op === 'GET') {
            getResults.push(cache.get(parts[1]));
        } else if (op === 'DEL') {
            cache.del(parts[1]);
        }
    }

    process.stdout.write((getResults.length > 0 ? getResults.join(' ') : 'EMPTY') + '\n');
    const remainingKeys = cache.getKeys();
    process.stdout.write((remainingKeys.length > 0 ? remainingKeys.join(' ') : 'EMPTY') + '\n');
}

main();
