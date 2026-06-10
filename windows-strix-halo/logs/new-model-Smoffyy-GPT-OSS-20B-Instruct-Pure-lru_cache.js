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
    constructor(key, val) {
        this.prev = null;
        this.next = null;
        this.key = key;
        this.val = val;
    }
}
class LRUCache {
    constructor(capacity) {
        this.map = new Map();
        this.capacity = capacity;
        this.head = new Node('', 0); // dummy head (most recent)
        this.tail = new Node('', 0); // dummy tail (least recent)
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    remove(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    addToHead(node) {
        const first = this.head.next;
        node.next = first;
        node.prev = this.head;
        this.head.next = node;
        first.prev = node;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return -1;
        this.remove(node);
        this.addToHead(node);
        return node.val;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            node.val = value;
            this.remove(node);
            this.addToHead(node);
        }
        else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
            if (this.map.size > this.capacity) {
                const lru = this.tail.prev;
                this.remove(lru);
                this.map.delete(lru.key);
            }
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (!node)
            return;
        this.remove(node);
        this.map.delete(key);
    }
    getKeysFromMRUtoLRU() {
        const res = [];
        let cur = this.head.next;
        while (cur && cur !== this.tail) {
            res.push(cur.key);
            cur = cur.next;
        }
        return res;
    }
}
const input = fs.readFileSync(0, 'utf8').trimEnd().split('\n');
if (input.length === 0) {
    console.log('EMPTY');
    console.log('EMPTY');
    process.exit(0);
}
const [CStr, NStr] = input[0].trim().split(/\s+/);
const capacity = parseInt(CStr, 10);
const N = parseInt(NStr, 10);
const cache = new LRUCache(capacity);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const line = input[i];
    if (!line)
        continue;
    const parts = line.trim().split(/\s+/);
    const cmd = parts[0];
    if (cmd === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (cmd === 'GET') {
        const key = parts[1];
        const val = cache.get(key);
        getResults.push(val.toString());
    }
    else if (cmd === 'DEL') {
        const key = parts[1];
        cache.del(key);
    }
}
console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
const keys = cache.getKeysFromMRUtoLRU();
console.log(keys.length > 0 ? keys.join(' ') : 'EMPTY');
