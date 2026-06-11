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
class LRUCache {
    constructor(capacity) {
        this.head = null; // Dummy head
        this.tail = null; // Dummy tail
        this.capacity = capacity;
        this.cacheMap = new Map();
        this.nodes = new Map();
        // Initialize dummy head and tail
        const dummyHead = { key: "HEAD" };
        const dummyTail = { key: "TAIL" };
        this.head = dummyHead;
        this.tail = dummyTail;
        dummyHead.next = dummyTail;
        dummyTail.prev = dummyHead;
    }
    removeNode(key) {
        const nodeInfo = this.nodes.get(key);
        if (!nodeInfo)
            return;
        const prevNode = nodeInfo.prev;
        const nextNode = nodeInfo.next;
        prevNode.next = nextNode;
        nextNode.prev = prevNode;
        this.nodes.delete(key);
    }
    moveToHead(key) {
        const nodeInfo = this.nodes.get(key);
        if (!nodeInfo)
            return;
        this.removeNode(key);
        // Insert right after dummy head (MRU position)
        const newNode = { key: key };
        const headNode = this.head;
        newNode.prev = headNode;
        newNode.next = headNode.next;
        headNode.next.prev = newNode;
        headNode.next = newNode;
        this.nodes.set(key, { prev: headNode, next: newNode.next });
    }
    insertAtHead(key, value) {
        const newNode = { key: key };
        const headNode = this.head;
        newNode.prev = headNode;
        newNode.next = headNode.next;
        headNode.next.prev = newNode;
        headNode.next = newNode;
        this.nodes.set(key, { prev: headNode, next: newNode.next });
    }
    evictLRU() {
        // The node before the dummy tail is the LRU
        const lruNode = this.tail.prev;
        const lruKey = lruNode.key;
        this.removeNode(lruKey);
        this.cacheMap.delete(lruKey);
        return lruKey;
    }
    put(key, value) {
        if (this.cacheMap.has(key)) {
            // Update existing key and move to head
            const entry = this.cacheMap.get(key);
            this.cacheMap.set(key, { key, value });
            this.moveToHead(key);
        }
        else {
            // New insertion
            if (this.cacheMap.size >= this.capacity) {
                this.evictLRU();
            }
            this.cacheMap.set(key, { key, value });
            this.insertAtHead(key, value);
        }
    }
    get(key) {
        if (!this.cacheMap.has(key)) {
            return -1;
        }
        const entry = this.cacheMap.get(key);
        // Access makes it MRU
        this.moveToHead(key);
        return entry.value;
    }
    del(key) {
        if (this.cacheMap.has(key)) {
            this.removeNode(key);
            this.cacheMap.delete(key);
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
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0 || input[0] === "")
        return;
    const [CStr, NStr] = input[0].split(' ').map(s => s.trim()).filter(s => s.length > 0);
    const C = parseInt(CStr);
    const N = parseInt(NStr);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = input[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/).filter(s => s.length > 0);
        const command = parts[0];
        const key = parts[1];
        if (command === 'PUT') {
            const value = parseInt(parts[2]);
            cache.put(key, value);
        }
        else if (command === 'GET') {
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (command === 'DEL') {
            cache.del(key);
        }
    }
    // Output 1: GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(' '));
    }
    // Output 2: Remaining keys in order (MRU to LRU)
    const orderedKeys = cache.getKeysInOrder();
    if (orderedKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(orderedKeys.join(' '));
    }
}
solve();
