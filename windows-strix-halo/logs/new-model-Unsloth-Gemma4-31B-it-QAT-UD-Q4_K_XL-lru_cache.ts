import * as fs from 'fs';

class Node<K, V> {
    key: K;
    value: V;
    prev: Node<K, V> | null = null;
    next: Node<K, V> | null = null;

    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
    }
}

class LRUCache<K, V> {
    private capacity: number;
    private map: Map<K, Node<K, V>>;
    private head: Node<K, V> | null = null;
    private tail: Node<K, V> | null = null;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
    }

    private remove(node: Node<K, V>) {
        if (node.prev) node.prev.next = node.next;
        else this.head = node.next;
        if (node.next) node.next.prev = node.prev;
        else this.tail = node.prev;
    }

    private setMRU(node: Node<K, V>) {
        if (this.head === node) return;
        this.remove(node);
        node.next = this.head;
        node.prev = null;
        if (this.head) this.head.prev = node;
        this.head = node;
        if (!this.tail) this.tail = node;
    }

    put(key: K, value: V): void {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.value = value;
            this.setMRU(node);
        } else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail;
                if (lru) {
                    this.map.delete(lru.key);
                    this.remove(lru);
                }
            }
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.setMRU(newNode);
        }
    }

    get(key: K): V | null {
        const node = this.map.get(key);
        if (!node) return null;
        this.setMRU(node);
        return node.value;
    }

    del(key: K): void {
        const node = this.map.get(key);
        if (node) {
            this.map.delete(key);
            this.remove(node);
        }
    }

    getKeys(): K[] {
        const keys: K[] = [];
        let curr = this.head;
        while (curr) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    let ptr = 0;
    
    if (ptr >= input.length) return;
    const C = parseInt(input[ptr++]);
    const N = parseInt(input[ptr++]);
    
    const cache = new LRUCache<string, number>(C);
    const getResults: number[] = [];

    for (let i = 0; i < N; i++) {
        const op = input[ptr++];
        if (op === 'PUT') {
            const key = input[ptr++];
            const value = parseInt(input[ptr++]);
            cache.put(key, value);
        } else if (op === 'GET') {
            const key = input[ptr++];
            const val = cache.get(key);
            getResults.push(val === null ? -1 : val);
        } else if (op === 'DEL') {
            const key = input[ptr++];
            cache.del(key);
        }
    }

    process.stdout.write((getResults.length > 0 ? getResults.join(' ') : 'EMPTY') + '\n');
    const finalKeys = cache.getKeys();
    process.stdout.write((finalKeys.length > 0 ? finalKeys.join(' ') : 'EMPTY') + '\n');
}

solve();
