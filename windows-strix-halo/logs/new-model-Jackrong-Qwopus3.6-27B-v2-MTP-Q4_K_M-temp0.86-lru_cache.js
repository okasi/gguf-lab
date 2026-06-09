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
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    removeNode(node) {
        if (node.prev)
            node.prev.next = node.next;
        if (node.next)
            node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
    }
    insertAtFront(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    moveToFront(node) {
        if (node === this.head.next)
            return;
        this.removeNode(node);
        this.insertAtFront(node);
    }
    removeLRU() {
        const lruNode = this.tail.prev;
        this.removeNode(lruNode);
        this.map.delete(lruNode.key);
        this.size--;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return null;
        this.moveToFront(node);
        return node.value;
    }
    put(key, value) {
        let node = this.map.get(key);
        if (node) {
            node.value = value;
            this.moveToFront(node);
            return;
        }
        if (this.size === this.capacity) {
            this.removeLRU();
        }
        node = new Node(key, value);
        this.insertAtFront(node);
        this.map.set(key, node);
        this.size++;
    }
    del(key) {
        const node = this.map.get(key);
        if (!node)
            return;
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
    }
    getKeysFromMostRecent() {
        const keys = [];
        let cur = this.head.next;
        while (cur !== this.tail) {
            keys.push(cur.key);
            cur = cur.next;
        }
        return keys;
    }
}
function main() {
    const data = fs.readFileSync(0, 'utf8');
    const lines = data.trim().split(/\r?\n/);
    if (lines.length === 0)
        return;
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        if (cmd === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (cmd === 'GET') {
            const key = parts[1];
            const val = cache.get(key);
            getResults.push(val === null ? '-1' : val.toString());
        }
        else if (cmd === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }
    const firstLineOut = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    console.log(firstLineOut);
    const keys = cache.getKeysFromMostRecent();
    const secondLineOut = keys.length > 0 ? keys.join(' ') : 'EMPTY';
    console.log(secondLineOut);
}
main();
