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
        this.head = null;
        this.tail = null;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToFront(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToFront(node);
        }
        else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToFront(newNode);
            this.size++;
            if (this.size > this.capacity) {
                this.removeTail();
            }
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (!node) {
            return;
        }
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
    }
    getKeys() {
        const keys = [];
        let cur = this.head;
        while (cur) {
            keys.push(cur.key);
            cur = cur.next;
        }
        return keys;
    }
    addToFront(node) {
        if (!this.head) {
            this.head = this.tail = node;
            node.prev = null;
            node.next = null;
        }
        else {
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
            node.prev = null;
        }
    }
    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            this.tail = node.prev;
        }
        node.prev = null;
        node.next = null;
    }
    moveToFront(node) {
        if (node === this.head) {
            return;
        }
        this.removeNode(node);
        this.addToFront(node);
    }
    removeTail() {
        if (!this.tail) {
            return;
        }
        const tailNode = this.tail;
        this.removeNode(tailNode);
        this.map.delete(tailNode.key);
        this.size--;
    }
}
function main() {
    const input = fs_1.default.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const firstLine = lines[0].split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        if (!line)
            break;
        const parts = line.split(/\s+/);
        const op = parts[0];
        const key = parts[1];
        if (op === 'PUT') {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (op === 'GET') {
            const val = cache.get(key);
            getResults.push(val);
        }
        else if (op === 'DEL') {
            cache.del(key);
        }
    }
    if (getResults.length === 0) {
        process.stdout.write('EMPTY\n');
    }
    else {
        process.stdout.write(getResults.join(' ') + '\n');
    }
    const keys = cache.getKeys();
    if (keys.length === 0) {
        process.stdout.write('EMPTY\n');
    }
    else {
        process.stdout.write(keys.join(' ') + '\n');
    }
}
main();
