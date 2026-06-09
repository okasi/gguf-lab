import * as fs from "fs";

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
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private addToFront(node: Node): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next!.prev = node;
        this.head.next = node;
    }

    private removeNode(node: Node): void {
        const prev = node.prev!;
        const next = node.next!;
        prev.next = next;
        next.prev = prev;
    }

    private moveToFront(node: Node): void {
        this.removeNode(node);
        this.addToFront(node);
    }

    private removeTail(): Node | null {
        const node = this.tail.prev;
        if (node) {
            this.removeNode(node);
            return node;
        }
        return null;
    }

    put(key: string, value: number): void {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToFront(existing);
            return;
        }

        const node = new Node(key, value);
        this.addToFront(node);
        this.map.set(key, node);

        if (this.map.size > this.capacity) {
            const removed = this.removeTail();
            if (removed) {
                this.map.delete(removed.key);
            }
        }
    }

    get(key: string): number {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToFront(node);
        return node.value;
    }

    del(key: string): void {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
        }
    }

    getKeys(): string[] {
        const keys: string[] = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [capacityStr, nStr] = lines[0].split(" ");
    const capacity = parseInt(capacityStr);
    const n = parseInt(nStr);

    const cache = new LRUCache(capacity);
    const getResults: string[] = [];

    for (let i = 1; i <= n; i++) {
        const parts = lines[i].split(" ");
        const operation = parts[0];
        const key = parts[1];
        const value = parts[2];

        if (operation === "PUT") {
            cache.put(key, parseInt(value));
        } else if (operation === "GET") {
            const result = cache.get(key);
            getResults.push(result.toString());
        } else if (operation === "DEL") {
            cache.del(key);
        }
    }

    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(" "));
    }

    const keys = cache.getKeys();
    if (keys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(keys.join(" "));
    }
}

main();
