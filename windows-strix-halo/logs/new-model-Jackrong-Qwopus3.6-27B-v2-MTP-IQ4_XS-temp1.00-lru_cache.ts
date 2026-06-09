import * as fs from 'fs';

class Node {
    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
    key: string;
    value: number;
    prev: Node | null = null;
    next: Node | null = null;
}

class LRUCache {
    private capacity: number;
    private map: Map<string, Node>;
    private size: number;
    private head: Node;
    private tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.size = 0;
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private _addFirst(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    private _removeNode(node: Node): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
        node.prev = null;
        node.next = null;
    }

    private _removeLast(): Node {
        const node = this.tail.prev!;
        this._removeNode(node);
        return node;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this._removeNode(node);
        this._addFirst(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this._removeNode(node);
            this._addFirst(node);
        } else {
            const newNode = new Node(key, value);
            this._addFirst(newNode);
            this.map.set(key, newNode);
            this.size++;
            if (this.size > this.capacity) {
                const lastNode = this._removeLast();
                this.map.delete(lastNode.key);
                this.size--;
            }
        }
    }

    remove(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this._removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeysInOrder(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next!;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    if (lines.length === 0) {
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }
    const firstParts = lines[0].trim().split(/\s+/);
    const C = parseInt(firstParts[0], 10);
    const N = parseInt(firstParts[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N && i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') continue;
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        if (cmd === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (cmd === 'GET') {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        } else if (cmd === 'DEL') {
            const key = parts[1];
            cache.remove(key);
        }
    }

    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(' '));
    }

    const keys = cache.getKeysInOrder();
    if (keys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(keys.join(' '));
    }
}

main();
