import * as fs from 'fs';

class Node {
    key: string;
    val: number;
    prev: Node | null = null;
    next: Node | null = null;
    constructor(key: string, val: number) {
        this.key = key;
        this.val = val;
    }
}

class LRUCache {
    private capacity: number;
    private map: Map<string, Node> = new Map();
    private head: Node;
    private tail: Node;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.head = new Node('', 0); // dummy head (most recent)
        this.tail = new Node('', 0); // dummy tail (least recent)
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private remove(node: Node): void {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private addToHead(node: Node): void {
        const first = this.head.next!;
        node.next = first;
        node.prev = this.head;
        this.head.next = node;
        first.prev = node;
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) return -1;
        this.remove(node);
        this.addToHead(node);
        return node.val;
    }

    put(key: string, value: number): void {
        const node = this.map.get(key);
        if (node) {
            node.val = value;
            this.remove(node);
            this.addToHead(node);
        } else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
            if (this.map.size > this.capacity) {
                const lru = this.tail.prev!;
                this.remove(lru);
                this.map.delete(lru.key);
            }
        }
    }

    del(key: string): void {
        const node = this.map.get(key);
        if (!node) return;
        this.remove(node);
        this.map.delete(key);
    }

    getKeysFromMRUtoLRU(): string[] {
        const res: string[] = [];
        let cur = this.head.next;
        while (cur && cur !== this.tail) {
            res.push(cur.key);
            cur = cur.next;
        }
        return res;
    }
}

const input = fs.readFileSync(0, 'utf8').trimEnd().split('\n');
if (input.length === 0) {
    console.log('EMPTY');
    console.log('EMPTY');
    process.exit(0);
}

const [CStr, NStr] = input[0].trim().split(/\s+/);
const capacity = parseInt(CStr, 10);
const N = parseInt(NStr, 10);

const cache = new LRUCache(capacity);
const getResults: string[] = [];

for (let i = 1; i <= N; i++) {
    const line = input[i];
    if (!line) continue;
    const parts = line.trim().split(/\s+/);
    const cmd = parts[0];
    if (cmd === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    } else if (cmd === 'GET') {
        const key = parts[1];
        const val = cache.get(key);
        getResults.push(val.toString());
    } else if (cmd === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}

console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
const keys = cache.getKeysFromMRUtoLRU();
console.log(keys.length > 0 ? keys.join(' ') : 'EMPTY');
