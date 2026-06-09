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
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    private removeNode(node: Node): void {
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
    }

    private insertAtFront(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    private moveToFront(node: Node): void {
        if (node === this.head.next) return;
        this.removeNode(node);
        this.insertAtFront(node);
    }

    private removeLRU(): void {
        const lruNode = this.tail.prev!;
        this.removeNode(lruNode);
        this.map.delete(lruNode.key);
        this.size--;
    }

    get(key: string): number | null {
        const node = this.map.get(key);
        if (!node) return null;
        this.moveToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        let node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToFront(node);
            return;
        }
        if (this.size === this.capacity) {
            this.removeLRU();
        }
        node = new Node(key, value);
        this.insertAtFront(node);
        this.map.set(key, node);
        this.size++;
    }

    del(key: string): void {
        const node = this.map.get(key);
        if (!node) return;
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
    }

    getKeysFromMostRecent(): string[] {
        const keys: string[] = [];
        let cur = this.head.next;
        while (cur !== this.tail) {
            keys.push(cur.key);
            cur = cur.next!;
        }
        return keys;
    }
}

function main(): void {
    const data = fs.readFileSync(0, 'utf8');
    const lines = data.trim().split(/\r?\n/);
    if (lines.length === 0) return;

    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);

    const cache = new LRUCache(C);
    const getResults: string[] = [];

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
            getResults.push(val === null ? '-1' : val.toString());
        } else if (cmd === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }

    const firstLineOut = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    console.log(firstLineOut);

    const keys = cache.getKeysFromMostRecent();
    const secondLineOut = keys.length > 0 ? keys.join(' ') : 'EMPTY';
    console.log(secondLineOut);
}

main();
