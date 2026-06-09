"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
class DoublyLinkedList {
    constructor() {
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
    }
    moveToHead(node) {
        this.remove(node);
        this.addHead(node);
    }
    removeTail() {
        if (this.tail.prev === this.head) {
            return null;
        }
        const node = this.tail.prev;
        this.remove(node);
        return node;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.list = new DoublyLinkedList();
    }
    get(key) {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.list.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.list.moveToHead(node);
            return;
        }
        const newNode = new Node(key, value);
        this.list.addHead(newNode);
        this.map.set(key, newNode);
        this.size++;
        if (this.size > this.capacity) {
            const tailNode = this.list.removeTail();
            if (tailNode) {
                this.map.delete(tailNode.key);
                this.size--;
            }
        }
    }
    delete(key) {
        const node = this.map.get(key);
        if (!node) {
            return;
        }
        this.list.remove(node);
        this.map.delete(key);
        this.size--;
    }
    getKeysInOrder() {
        const keys = [];
        let current = this.list.head.next;
        while (current && current !== this.list.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split('\n');
const firstLine = lines[0].split(' ');
const capacity = parseInt(firstLine[0], 10);
const numOps = parseInt(firstLine[1], 10);
const cache = new LRUCache(capacity);
const getResults = [];
for (let i = 1; i <= numOps; i++) {
    const parts = lines[i].split(' ');
    const operation = parts[0];
    const key = parts[1];
    if (operation === 'GET') {
        const value = cache.get(key);
        getResults.push(value);
    }
    else if (operation === 'PUT') {
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (operation === 'DEL') {
        cache.delete(key);
    }
}
if (getResults.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(getResults.join(' '));
}
const remainingKeys = cache.getKeysInOrder();
if (remainingKeys.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(remainingKeys.join(' '));
}
