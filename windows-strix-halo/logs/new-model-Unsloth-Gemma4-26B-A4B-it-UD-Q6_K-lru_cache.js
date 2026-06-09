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
class ListNode {
    constructor(key, value) {
        this.prev = null;
        this.next = null;
        this.key = key;
        this.value = value;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new ListNode("", 0);
        this.tail = new ListNode("", 0);
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
        const next = this.head.next;
        node.next = next;
        node.prev = this.head;
        this.head.next = node;
        next.prev = node;
    }
    get(key) {
        const node = this.map.get(key);
        if (node === undefined)
            return -1;
        this.remove(node);
        this.addToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node !== undefined) {
            node.value = value;
            this.remove(node);
            this.addToHead(node);
        }
        else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail.prev;
                if (lru !== this.head) {
                    this.remove(lru);
                    this.map.delete(lru.key);
                }
            }
            const newNode = new ListNode(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (node !== undefined) {
            this.remove(node);
            this.map.delete(key);
        }
    }
    getRemainingKeys() {
        const keys = [];
        let curr = this.head.next;
        while (curr !== this.tail && curr !== null) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
function solve() {
    let inputStr;
    try {
        inputStr = fs.readFileSync(0, "utf8");
    }
    catch (e) {
        return;
    }
    const tokens = inputStr.split(/\s+/);
    let idx = 0;
    while (idx < tokens.length && tokens[idx] === "") {
        idx++;
    }
    if (idx >= tokens.length)
        return;
    const C = parseInt(tokens[idx++]);
    const N = parseInt(tokens[idx++]);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 0; i < N; i++) {
        const op = tokens[idx++];
        if (op === 'PUT') {
            const key = tokens[idx++];
            const val = parseInt(tokens[idx++]);
            cache.put(key, val);
        }
        else if (op === 'GET') {
            const key = tokens[idx++];
            getResults.push(cache.get(key));
        }
        else if (op === 'DEL') {
            const key = tokens[idx++];
            cache.del(key);
        }
    }
    if (getResults.length === 0) {
        process.stdout.write("EMPTY\n");
    }
    else {
        process.stdout.write(getResults.join(" ") + "\n");
    }
    const remainingKeys = cache.getRemainingKeys();
    if (remainingKeys.length === 0) {
        process.stdout.write("EMPTY\n");
    }
    else {
        process.stdout.write(remainingKeys.join(" ") + "\n");
    }
}
solve();
