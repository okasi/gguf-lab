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
    private map: Map<string, Node>;
    private dummyHead: Node;
    private dummyTail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.dummyHead = new Node('', 0);
        this.dummyTail = new Node('', 0);
        this.dummyHead.next = this.dummyTail;
        this.dummyTail.prev = this.dummyHead;
    }

    private addAfterHead(node: Node): void {
        node.prev = this.dummyHead;
        node.next = this.dummyHead.next;
        this.dummyHead.next.prev = node;
        this.dummyHead.next = node;
    }

    private removeNode(node: Node): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }

    private evictLRU(): void {
        const lruNode = this.dummyTail.prev!;
        this.removeNode(lruNode);
        this.map.delete(lruNode.key);
        this.size--;
    }

    public put(key: string, value: number): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.removeNode(node);
            this.addAfterHead(node);
        } else {
            if (this.size === this.capacity) {
                this.evictLRU();
            }
            const newNode = new Node(key, value);
            this.addAfterHead(newNode);
            this.map.set(key, newNode);
            this.size++;
        }
    }

    public get(key: string): number {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key)!;
        const val = node.value;
        this.removeNode(node);
        this.addAfterHead(node);
        return val;
    }

    public del(key: string): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }

    public getKeysInOrder(): string[] {
        const keys: string[] = [];
        let curr = this.dummyHead.next;
        while (curr !== this.dummyTail) {
            keys.push(curr.key);
            curr = curr.next!;
        }
        return keys;
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const firstLine = lines[0].trim();
    const [C, N] = firstLine.split(/\s+/).map(Number);

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

    // Output first line
    if (getResults.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(getResults.join(' '));
    }

    // Output second line
    const keys = cache.getKeysInOrder();
    if (keys.length === 0) {
        console.log('EMPTY');
    } else {
        console.log(keys.join(' '));
    }
}

main();
