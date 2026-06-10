"use strict";
const input = fs.readFileSync(0, "utf8").trim().split("\n");
const firstLine = input[0].split(" ");
const C = parseInt(firstLine[0]);
const N = parseInt(firstLine[1]);
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    // Remove a node from the doubly linked list
    remove(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    // Add a node right after head (most recently used)
    addToFront(node) {
        const next = this.head.next;
        this.head.next = node;
        node.prev = this.head;
        node.next = next;
        next.prev = node;
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this.remove(node);
        this.addToFront(node);
        return node.value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.remove(node);
            this.addToFront(node);
        }
        else {
            if (this.map.size >= this.capacity) {
                const lastNode = this.tail.prev;
                this.remove(lastNode);
                this.map.delete(lastNode.key);
            }
            const newNode = new Node(key, value);
            this.addToFront(newNode);
            this.map.set(key, newNode);
        }
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.remove(node);
            this.map.delete(key);
        }
    }
    getKeysInOrder() {
        const keys = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const line = input[i].trim();
    const parts = line.split(" ");
    const operation = parts[0];
    const key = parts[1];
    if (operation === "GET") {
        const result = cache.get(key);
        getResults.push(result);
    }
    else if (operation === "PUT") {
        const value = parseInt(parts[2]);
        cache.put(key, value);
    }
    else if (operation === "DEL") {
        cache.del(key);
    }
}
if (getResults.length === 0) {
    console.log("EMPTY");
}
else {
    console.log(getResults.join(" "));
}
const remainingKeys = cache.getKeysInOrder();
if (remainingKeys.length === 0) {
    console.log("EMPTY");
}
else {
    console.log(remainingKeys.join(" "));
}
