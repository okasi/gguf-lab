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
        this.remove(node);
        node.next = this.head;
        node.prev = null;
        if (this.head) this.head.prev = node;
        this.head = node;
        if (!this.tail) this.tail = node;
    }

    private addToMRU(node: Node<K, V>) {
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
                    this.remove(lru);
                    this.map.delete(lru.key);
                }
            }
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToMRU(newNode);
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
            this.remove(node);
            this.map.delete(key);
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
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split(/\r?\n/);
    if (lines.length === 0) return;

    const firstLine = lines[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;
    
    const C = parseInt(firstLine[0]);
    const N = parseInt(firstLine[1]);
    const lru = new LRUCache<string, number>(C);
    const getResults: string[] = [];

    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        if (!line) continue;
        const parts = line.trim().split(/\s+/);
        const op = parts[0];

        if (op === 'PUT') {
            lru.put(parts[1], parseInt(parts[2]));
        } else if (op === 'GET') {
            const val = lru.get(parts[1]);
            getResults.push(val === null ? "-1" : val.toString());
        } else if (op === 'DEL') {
            lru.del(parts[1]);
        }
    }

    process.stdout.write((getResults.length > 0 ? getResults.join(" ") : "EMPTY") + "\n");
    const finalKeys = lru.getKeys();
    process.stdout.write((finalKeys.length > 0 ? finalKeys.join(" ") : "EMPTY") + "\n");
}

solve();
