import * as fs from "fs";

class LRUCache {
    private capacity: number;
    private keyNodeMap: Map<string, DoublyListNode>;
    private head: DoublyListNode;
    private tail: DoublyListNode;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.keyNodeMap = new Map();
        this.head = new DoublyListNode(null, null);
        this.tail = new DoublyListNode(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    private removeFromNode(node: DoublyListNode): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }

    private addToHead(node: DoublyListNode): void {
        node.next = this.head.next;
        this.head.next!.prev = node;
        this.head.next = node;
        node.prev = this.head;
    }

    private removeTail(): DoublyListNode | null {
        const node = this.tail.prev;
        if (node === this.head) {
            return null;
        }
        this.removeFromNode(node);
        return node;
    }

    get(key: string): number {
        const node = this.keyNodeMap.get(key);
        if (!node) {
            return -1;
        }
        this.removeFromNode(node);
        this.addToHead(node);
        return node.value;
    }

    put(key: string, value: number): void {
        const existingNode = this.keyNodeMap.get(key);
        if (existingNode) {
            existingNode.value = value;
            this.removeFromNode(existingNode);
            this.addToHead(existingNode);
        } else {
            if (this.keyNodeMap.size >= this.capacity) {
                const evictedNode = this.removeTail();
                if (evictedNode) {
                    this.keyNodeMap.delete(evictedNode.key!);
                }
            }
            const newNode = new DoublyListNode(key, value);
            this.addToHead(newNode);
            this.keyNodeMap.set(key, newNode);
        }
    }

    delete(key: string): void {
        const node = this.keyNodeMap.get(key);
        if (node) {
            this.removeFromNode(node);
            this.keyNodeMap.delete(key);
        }
    }

    getLRUOrder(): string[] {
        const result: string[] = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            result.push(current.key!);
            current = current.next;
        }
        return result;
    }
}

class DoublyListNode {
    public key: string | null;
    public value: number;
    public prev: DoublyListNode | null;
    public next: DoublyListNode | null;

    constructor(key: string | null, value: number) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const firstLine = lines[0].split(/\s+/);
    const capacity = parseInt(firstLine[0], 10);
    const n = parseInt(firstLine[1], 10);

    const cache = new LRUCache(capacity);
    const getResults: string[] = [];

    for (let i = 1; i <= n; i++) {
        const parts = lines[i].split(/\s+/);
        const operation = parts[0];
        const key = parts[1];

        if (operation === "GET") {
            const result = cache.get(key);
            getResults.push(String(result));
        } else if (operation === "PUT") {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        } else if (operation === "DEL") {
            cache.delete(key);
        }
    }

    const getOutput = getResults.length > 0 ? getResults.join(" ") : "EMPTY";
    const keysOrder = cache.getLRUOrder();
    const keysOutput = keysOrder.length > 0 ? keysOrder.join(" ") : "EMPTY";

    console.log(getOutput);
    console.log(keysOutput);
}

main();
