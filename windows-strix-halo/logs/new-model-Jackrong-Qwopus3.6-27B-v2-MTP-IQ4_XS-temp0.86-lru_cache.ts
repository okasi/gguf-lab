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
    map: Map<string, Node>;
    head: Node;
    tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private _remove(node: Node): void {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private _add(node: Node): void {
        const last = this.tail.prev!;
        last.next = node;
        node.prev = last;
        node.next = this.tail;
        this.tail.prev = node;
    }

    private _moveToTail(node: Node): void {
        this._remove(node);
        this._add(node);
    }

    get(key: string): number {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this._moveToTail(node);
            return node.value;
        }
        return -1;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this._moveToTail(node);
        } else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this._add(node);
            this.size++;
            if (this.size > this.capacity) {
                const lruNode = this.head.next!;
                this._remove(lruNode);
                this.map.delete(lruNode.key);
                this.size--;
            }
        }
    }

    del(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this._remove(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeysFromMRUToLRU(): string[] {
        const keys: string[] = [];
        let curr = this.tail.prev;
        while (curr !== this.head) {
            keys.push(curr!.key);
            curr = curr!.prev;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');
    if (lines.length === 0) return;

    const firstParts = lines[0].trim().split(/\s+/);
    const C = parseInt(firstParts[0], 10);
    const N = parseInt(firstParts[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const parts = lines[i].trim().split(/\s+/);
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

    if (getResults.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(getResults.join(' '));
    }

    const remainingKeys = cache.getKeysFromMRUToLRU();
    if (remainingKeys.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(remainingKeys.join(' '));
    }
}

main();
