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
        this.prev = null;
        this.next = null;
        this.key = key;
        this.value = value;
    }
}
class LRUCache {
    constructor(capacity) {
        this.size = 0;
        this.map = new Map();
        this.head = null; // most recent
        this.tail = null; // least recent
        this.capacity = capacity;
    }
    moveToHead(node) {
        if (this.head === node)
            return;
        this.removeNode(node);
        this.addNodeAtHead(node);
    }
    addNodeAtHead(node) {
        node.prev = null;
        node.next = this.head;
        if (this.head)
            this.head.prev = node;
        this.head = node;
        if (!this.tail)
            this.tail = node;
    }
    removeNode(node) {
        if (node.prev)
            node.prev.next = node.next;
        else
            this.head = node.next;
        if (node.next)
            node.next.prev = node.prev;
        else
            this.tail = node.prev;
        node.prev = null;
        node.next = null;
    }
    removeTail() {
        if (!this.tail)
            return;
        const node = this.tail;
        this.removeNode(node);
        this.map.delete(node.key);
        this.size--;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return -1;
        this.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToHead(node);
        }
        else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addNodeAtHead(newNode);
            this.size++;
            if (this.size > this.capacity) {
                this.removeTail();
            }
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (!node)
            return;
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
    }
    getKeys() {
        const keys = [];
        let curr = this.head;
        while (curr) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
const input = fs.readFileSync(0, 'utf8').trimEnd().split('\n');
if (input.length === 0)
    process.exit(0);
const [CStr, NStr] = input[0].trim().split(/\s+/);
const capacity = parseInt(CStr, 10);
const N = parseInt(NStr, 10);
const cache = new LRUCache(capacity);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const line = input[i].trim();
    if (!line)
        continue;
    const parts = line.split(/\s+/);
    const cmd = parts[0];
    if (cmd === 'GET') {
        const key = parts[1];
        const val = cache.get(key);
        getResults.push(val);
    }
    else if (cmd === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (cmd === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}
const out1 = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
const keys = cache.getKeys();
const out2 = keys.length > 0 ? keys.join(' ') : 'EMPTY';
console.log(out1);
console.log(out2);
