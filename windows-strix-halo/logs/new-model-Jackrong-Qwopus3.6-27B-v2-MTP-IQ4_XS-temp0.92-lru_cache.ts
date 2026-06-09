import * as fs from 'fs';

class Node {
    key: string;
    value: number;
    prev: Node | null = null;
    next: Node | null = null;
    constructor(key: string, value: number) {
        this.key = key;
        this.value = value;
    }
}

class LRUCache {
    capacity: number;
    cache: Map<string, Node>;
    head: Node;
    tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private removeNode(node: Node): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }

    private addToFront(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    get(key: string): number {
        if (!this.cache.has(key)) {
            return -1;
        }
        const node = this.cache.get(key)!;
        this.removeNode(node);
        this.addToFront(node);
        return node.value;
    }

    put(key: string, value: number): void {
        if (this.cache.has(key)) {
            const node = this.cache.get(key)!;
            node.value = value;
            this.removeNode(node);
            this.addToFront(node);
        } else {
            if (this.cache.size === this.capacity) {
                const tailPrev = this.tail.prev!;
                this.removeNode(tailPrev);
                this.cache.delete(tailPrev.key);
            }
            const node = new Node(key, value);
            this.cache.set(key, node);
            this.addToFront(node);
        }
    }

    del(key: string): void {
        if (this.cache.has(key)) {
            const node = this.cache.get(key)!;
            this.removeNode(node);
            this.cache.delete(key);
        }
    }

    getKeysMRUtoLRU(): string[] {
        const keys: string[] = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next!;
        }
        return keys;
    }
}

function main(): void {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) return;
    const tokens = input.split(/\s+/);
    let idx = 0;
    const C = parseInt(tokens[idx++], 10);
    const N = parseInt(tokens[idx++], 10);
    const cache = new LRUCache(C);
    const getResults: number[] = [];
    for (let i = 0; i < N; i++) {
        const op = tokens[idx++];
        if (op === 'PUT') {
            const key = tokens[idx++];
            const value = parseInt(tokens[idx++], 10);
            cache.put(key, value);
        } else if (op === 'GET') {
            const key = tokens[idx++];
            getResults.push(cache.get(key));
        } else if (op === 'DEL') {
            const key = tokens[idx++];
            cache.del(key);
        }
    }
    if (getResults.length > 0) {
        console.log(getResults.join(' '));
    } else {
        console.log('EMPTY');
    }
    const keys = cache.getKeysMRUtoLRU();
    if (keys.length > 0) {
        console.log(keys.join(' '));
    } else {
        console.log('EMPTY');
    }
}

main();
