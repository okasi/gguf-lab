import * as fs from 'fs';

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    if (lines.length === 0) return;
    const firstLine = lines[0].split(/\s+/);
    const capacity = parseInt(firstLine[0], 10);
    const n = parseInt(firstLine[1], 10);

    const cache = new LRUCache(capacity);
    const getResults: string[] = [];

    for (let i = 1; i <= n; i++) {
        const line = lines[i];
        if (!line) continue;
        const parts = line.split(/\s+/);
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (op === 'GET') {
            const key = parts[1];
            const val = cache.get(key);
            getResults.push(val.toString());
        } else if (op === 'DEL') {
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
    map: Map<string, Node>;
    head: Node;
    tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.head = new Node('head', 0);
        this.tail = new Node('tail', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private _remove(node: Node): void {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private _addAfterHead(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) return -1;
        this._remove(node);
        this._addAfterHead(node);
        return node.value;
    }

    put(key: string, value: number): void {
        let node = this.map.get(key);
        if (node) {
            node.value = value;
            this._remove(node);
            this._addAfterHead(node);
        } else {
            node = new Node(key, value);
            this.map.set(key, node);
            this._addAfterHead(node);
            this.size++;
            if (this.size > this.capacity) {
                const lru = this.tail.prev;
                if (lru) {
                    this._remove(lru);
                    this.map.delete(lru.key);
                }
                this.size--;
            }
        }
    }

    del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this._remove(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeysInOrder(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}

main();
