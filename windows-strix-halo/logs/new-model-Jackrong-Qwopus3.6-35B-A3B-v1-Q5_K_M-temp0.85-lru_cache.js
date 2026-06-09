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
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node('', -1);
        this.tail = new Node('', -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
        node.prev = null;
        node.next = null;
    }
    removeTail() {
        const node = this.tail.prev;
        if (node && node !== this.head) {
            this.removeNode(node);
            return node;
        }
        return null;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            const node = new Node(key, value);
            this.addToHead(node);
            this.map.set(key, node);
            if (this.map.size > this.capacity) {
                const tail = this.removeTail();
                if (tail) {
                    this.map.delete(tail.key);
                }
            }
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this.moveToHead(node);
        return node.value;
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
        }
    }
    getKeysInOrder() {
        const keys = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
const input = fs.readFileSync(0, 'utf8').trim();
const lines = input.split('\n');
const firstLine = lines[0].split(' ');
const capacity = parseInt(firstLine[0], 10);
const numOperations = parseInt(firstLine[1], 10);
const cache = new LRUCache(capacity);
const getResults = [];
for (let i = 1; i <= numOperations; i++) {
    const line = lines[i].trim().split(' ');
    const operation = line[0];
    const key = line[1];
    const value = parseInt(line[2], 10);
    switch (operation) {
        case 'PUT':
            cache.put(key, value);
            break;
        case 'GET':
            const result = cache.get(key);
            getResults.push(result);
            break;
        case 'DEL':
            cache.del(key);
            break;
    }
}
if (getResults.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(getResults.join(' '));
}
const keys = cache.getKeysInOrder();
if (keys.length === 0) {
    console.log('EMPTY');
}
else {
    console.log(keys.join(' '));
}
