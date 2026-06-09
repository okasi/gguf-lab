import * as fs from "fs";

type Operation = { type: "PUT" | "GET" | "DEL", key: string, value?: number };

class LRUCache {
    capacity: number;
    map: Map<string, { value: number, node: Node }>;
    head: Node | null;
    tail: Node | null;
    getResults: number[];

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = null;
        this.tail = null;
        this.getResults = [];
    }

    put(key: string, value: number) {
        if (this.map.has(key)) {
            const node = this.map.get(key)!.node;
            node.value = value;
            this.moveToHead(node);
        } else {
            const newNode = new Node(key, value);
            if (this.map.size >= this.capacity) {
                this.evict();
            }
            this.addToHead(newNode);
            this.map.set(key, { value, node: newNode });
        }
    }

    get(key: string) {
        if (!this.map.has(key)) {
            this.getResults.push(-1);
            return;
        }
        const node = this.map.get(key)!.node;
        this.moveToHead(node);
        this.getResults.push(node.value);
    }

    del(key: string) {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key)!.node;
        this.removeNode(node);
        this.map.delete(key);
    }

    evict() {
        if (!this.tail) return;
        const keyToRemove = this.tail.key;
        this.removeNode(this.tail);
        this.map.delete(keyToRemove);
    }

    addToHead(node: Node) {
        node.next = this.head;
        node.prev = null;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }

    moveToHead(node: Node) {
        if (this.head === node) return;
        this.removeNode(node);
        this.addToHead(node);
    }

    removeNode(node: Node) {
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }
    }

    getKeys() {
        const keys: string[] = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

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

function main() {
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    if (!input.length) return;
    const [capacityStr, operationsStr] = input[0].split(" ");
    const capacity = parseInt(capacityStr);
    const operationsCount = parseInt(operationsStr);
    const cache = new LRUCache(capacity);
    const getResults: number[] = [];

    for (let i = 1; i <= operationsCount; i++) {
        const parts = input[i].split(" ");
        const op = parts[0];
        const key = parts[1];
        if (op === "PUT") {
            const value = parseInt(parts[2]);
            cache.put(key, value);
        } else if (op === "GET") {
            cache.get(key);
        } else if (op === "DEL") {
            cache.del(key);
        }
    }

    const getResults = cache.getResults;
    const remainingKeys = cache.getKeys();

    if (getResults.length) {
        console.log(getResults.join(" "));
    } else {
        console.log("EMPTY");
    }

    if (remainingKeys.length) {
        console.log(remainingKeys.join(" "));
    } else {
        console.log("EMPTY");
    }
}

main();
