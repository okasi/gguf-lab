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
    private size: number;
    private head: Node;
    private tail: Node;
    private map: Map<string, Node>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.map = new Map();
    }

    private _addNode(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    private _removeNode(node: Node): void {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
    }

    private _moveToFront(node: Node): void {
        this._removeNode(node);
        this._addNode(node);
    }

    private _evictTail(): void {
        const node = this.tail.prev;
        if (node && node !== this.head) {
            this._removeNode(node);
            this.map.delete(node.key);
            this.size--;
        }
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this._moveToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this._moveToFront(node);
        } else {
            if (this.size === this.capacity) {
                this._evictTail();
            }
            const node = new Node(key, value);
            this._addNode(node);
            this.map.set(key, node);
            this.size++;
        }
    }

    del(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this._removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getRemainingKeys(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}

const input = fs.readFileSync(0, 'utf8');
const lines = input.trim().split('\n');
const firstLine = lines[0].trim().split(/\s+/);
const C = parseInt(firstLine[0], 10);
const N = parseInt(firstLine[1], 10);

const cache = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
    const line = lines[i].trim();
    const parts = line.split(/\s+/);
    const cmd = parts[0];
    if (cmd === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    } else if (cmd === 'GET') {
        const key = parts[1];
        const val = cache.get(key);
        getResults.push(val);
    } else if (cmd === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}

const getLine = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
const keysLine = cache.getRemainingKeys().length > 0 ? cache.getRemainingKeys().join(' ') : 'EMPTY';
console.log(getLine);
console.log(keysLine);
