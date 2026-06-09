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
    private map: Map<string, Node>;
    private head: Node;
    private tail: Node;
    private size: number;

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
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }

    private addAfterHead(node: Node): void {
        const afterHead = this.head.next;
        node.next = afterHead;
        node.prev = this.head;
        this.head.next = node;
        afterHead.prev = node;
    }

    private moveToHead(node: Node): void {
        this.removeNode(node);
        this.addAfterHead(node);
    }

    put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.moveToHead(node);
        } else {
            const node = new Node(key, value);
            this.map.set(key, node);
            if (this.size === this.capacity) {
                const lru = this.tail.prev!;
                this.removeNode(lru);
                this.map.delete(lru.key);
                this.size--;
            }
            this.addAfterHead(node);
            this.size++;
        }
    }

    get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        this.moveToHead(node);
        return node.value;
    }

    del(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    getKeysFromMRUtoLRU(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next!;
        }
        return keys;
    }
}

const input = fs.readFileSync(0, 'utf8');
const lines = input.trimEnd().split('\n');
const firstLineParts = lines[0].split(' ');
const C = parseInt(firstLineParts[0], 10);
const N = parseInt(firstLineParts[1], 10);

const cache = new LRUCache(C);
const getResults: number[] = [];

for (let i = 1; i <= N; i++) {
    const line = lines[i];
    const parts = line.split(' ');
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

const remainingKeys = cache.getKeysFromMRUtoLRU();
if (remainingKeys.length === 0) {
    console.log('EMPTY');
} else {
    console.log(remainingKeys.join(' '));
}
