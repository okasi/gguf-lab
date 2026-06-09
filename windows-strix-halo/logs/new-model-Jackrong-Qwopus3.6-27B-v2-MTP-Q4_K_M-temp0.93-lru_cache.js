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
        this.size = 0;
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.map = new Map();
    }
    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    insertAfterHead(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    moveToFront(node) {
        this.remove(node);
        this.insertAfterHead(node);
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToFront(node);
        }
        else {
            if (this.size === this.capacity) {
                const lru = this.tail.prev;
                this.remove(lru);
                this.map.delete(lru.key);
                this.size--;
            }
            const node = new Node(key, value);
            this.insertAfterHead(node);
            this.map.set(key, node);
            this.size++;
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this.moveToFront(node);
        return node.value;
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.remove(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeys() {
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
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.split('\n');
    const firstLine = lines[0].trim();
    const [C, N] = firstLine.split(/\s+/).map(Number);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        if (!line)
            continue; // skip empty lines if any
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        const key = parts[1];
        if (cmd === 'PUT') {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (cmd === 'GET') {
            const val = cache.get(key);
            getResults.push(val);
        }
        else if (cmd === 'DEL') {
            cache.del(key);
        }
    }
    const out1 = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const keys = cache.getKeys();
    const out2 = keys.length > 0 ? keys.join(' ') : 'EMPTY';
    fs.writeFileSync(1, out1 + '\n' + out2 + '\n');
}
main();
