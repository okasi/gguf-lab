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
    map: Map<string, Node>;
    head: Node;
    tail: Node;
    size: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node('', 0); // dummy
        this.tail = new Node('', 0); // dummy
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    private _removeNode(node: Node): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }

    private _addAfterHead(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    private _moveToHead(node: Node): void {
        this._removeNode(node);
        this._addAfterHead(node);
    }

    private _removeTail(): void {
        const node = this.tail.prev!;
        this._removeNode(node);
        this.map.delete(node.key);
        this.size--;
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this._moveToHead(node);
        return node.value;
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this._moveToHead(node);
        } else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this._addAfterHead(node);
            this.size++;
            if (this.size > this.capacity) {
                this._removeTail();
            }
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

    getKeysOrder(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next!;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        if (!line) continue; // skip empty lines if any
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

    const firstOutput = getResults.length === 0 ? 'EMPTY' : getResults.join(' ');
    const keysOrder = cache.getKeysOrder();
    const secondOutput = keysOrder.length === 0 ? 'EMPTY' : keysOrder.join(' ');

    console.log(firstOutput);
    console.log(secondOutput);
}

main();
