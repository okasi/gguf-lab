import * as fs from "fs";

interface Node {
    key: string;
    value: number;
    prev: Node | null;
    next: Node | null;
}

class DoublyLinkedList {
    private head: Node | null = null;
    private tail: Node | null = null;

    public addToFront(node: Node): void {
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

    public removeNode(node: Node): void {
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
        node.prev = null;
        node.next = null;
    }

    public moveToFront(node: Node): void {
        this.removeNode(node);
        this.addToFront(node);
    }

    public removeLast(): Node | null {
        if (!this.tail) {
            return null;
        }
        const node = this.tail;
        this.removeNode(node);
        return node;
    }

    public isEmpty(): boolean {
        return this.head === null;
    }

    public getKeys(): string[] {
        const keys: string[] = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}

function main(): void {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;

    const lines = input.split("\n");
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);

    const cache = new Map<string, Node>();
    const list = new DoublyLinkedList();
    const getResults: number[] = [];

    for (let i = 1; i <= N && i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        const op = parts[0];

        if (op === "PUT") {
            const key = parts[1];
            const value = parseInt(parts[2], 10);

            if (cache.has(key)) {
                const existingNode = cache.get(key)!;
                list.moveToFront(existingNode);
                existingNode.value = value;
            } else {
                if (cache.size >= C) {
                    const lastNode = list.removeLast();
                    if (lastNode) {
                        cache.delete(lastNode.key);
                    }
                }
                const newNode: Node = {
                    key,
                    value,
                    prev: null,
                    next: null,
                };
                list.addToFront(newNode);
                cache.set(key, newNode);
            }
        } else if (op === "GET") {
            const key = parts[1];
            if (cache.has(key)) {
                const node = cache.get(key)!;
                list.moveToFront(node);
                getResults.push(node.value);
            } else {
                getResults.push(-1);
            }
        } else if (op === "DEL") {
            const key = parts[1];
            if (cache.has(key)) {
                const node = cache.get(key)!;
                list.removeNode(node);
                cache.delete(key);
            }
        }
    }

    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(" "));
    }

    const remainingKeys = list.getKeys();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(remainingKeys.join(" "));
    }
}

main();
