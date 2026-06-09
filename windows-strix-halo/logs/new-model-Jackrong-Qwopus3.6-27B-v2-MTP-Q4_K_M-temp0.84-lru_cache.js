"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
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
        this.size = 0;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    insertAtFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    get(key) {
        if (!this.map.has(key))
            return null;
        const node = this.map.get(key);
        this.remove(node);
        this.insertAtFront(node);
        return node.value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.remove(node);
            this.insertAtFront(node);
        }
        else {
            if (this.size === this.capacity) {
                const lru = this.tail.prev;
                this.remove(lru);
                this.map.delete(lru.key);
                this.size--;
            }
            const node = new Node(key, value);
            this.insertAtFront(node);
            this.map.set(key, node);
            this.size++;
        }
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.remove(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeysFromMostRecentToLeast() {
        const keys = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
function main() {
    const input = fs_1.default.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const firstLine = lines[0].trim();
    const parts = firstLine.split(/\s+/);
    const C = parseInt(parts[0], 10);
    const N = parseInt(parts[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        const words = line.split(/\s+/);
        const command = words[0];
        if (command === 'PUT') {
            const key = words[1];
            const value = parseInt(words[2], 10);
            cache.put(key, value);
        }
        else if (command === 'GET') {
            const key = words[1];
            const val = cache.get(key);
            if (val === null) {
                getResults.push(-1);
            }
            else {
                getResults.push(val);
            }
        }
        else if (command === 'DEL') {
            const key = words[1];
            cache.del(key);
        }
    }
    const firstLineOut = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const keys = cache.getKeysFromMostRecentToLeast();
    const secondLineOut = keys.length > 0 ? keys.join(' ') : 'EMPTY';
    console.log(firstLineOut);
    console.log(secondLineOut);
}
main();
