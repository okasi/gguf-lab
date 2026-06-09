const fs = require('fs');

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
    private map: Map<string, Node>;
    private head: Node;
    private tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private _addNode(node: Node): void {
        const next = this.head.next;
        node.next = next;
        node.prev = this.head;
        this.head.next = node;
        next.prev = node;
    }

    private _removeNode(node: Node): void {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
        node.prev = null;
        node.next = null;
    }

    private _moveToNode(node: Node): void {
        this._removeNode(node);
        this._addNode(node);
    }

    public get(key: string): number | -1 {
        const node = this.map.get(key);
        if (!node) return -1;
        this._moveToNode(node);
        return node.value;
    }

    public put(key: string, value: number): void {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this._moveToNode(node);
        } else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this._addNode(newNode);
            if (this.map.size > this.capacity) {
                const lruNode = this.tail.prev!;
                this.map.delete(lruNode.key);
                this._removeNode(lruNode);
            }
        }
    }

    public del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.map.delete(key);
            this._removeNode(node);
        }
    }

    public keys(): string[] {
        const result: string[] = [];
        let cur = this.head.next;
        while (cur !== this.tail) {
            result.push(cur.key);
            cur = cur.next!;
        }
        return result;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) return;
    const lines = input.split('\n');
    const firstLine = lines[0].trim();
    const parts = firstLine.split(/\s+/);
    const C = parseInt(parts[0], 10);
    const N = parseInt(parts[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        // In case there are fewer lines than N (should not happen), break
        if (!line) break;
        const tokens = line.split(/\s+/);
        const op = tokens[0];
        const key = tokens[1];
        if (op === 'PUT') {
            const value = parseInt(tokens[2], 10);
            cache.put(key, value);
        } else if (op === 'GET') {
            const res = cache.get(key);
            getResults.push(res);
        } else if (op === 'DEL') {
            cache.del(key);
        }
    }

    const firstOut = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const keys = cache.keys();
    const secondOut = keys.length > 0 ? keys.join(' ') : 'EMPTY';

    process.stdout.write(firstOut + '\n' + secondOut + '\n');
}

main();
