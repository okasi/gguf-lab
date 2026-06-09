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
        this.capacity = capacity;
        this.map = new Map();
        this.head = null;
        this.tail = null;
    }
    addHead(node) {
        if (this.head === null) {
            this.head = node;
            this.tail = node;
        }
        else {
            node.next = this.head;
            if (this.head)
                this.head.prev = node;
            this.head = node;
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
    }
    evict() {
        if (this.tail && this.tail.key) {
            const key = this.tail.key;
            this.removeNode(this.tail);
            this.map.delete(key);
            this.tail = this.tail.prev;
        }
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.removeNode(node);
            this.addHead(node);
        }
        else {
            const newNode = { key, value, prev: null, next: null };
            this.map.set(key, newNode);
            this.addHead(newNode);
            if (this.map.size > this.capacity) {
                this.evict();
            }
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return null;
        }
        const node = this.map.get(key);
        this.removeNode(node);
        this.addHead(node);
        return node.value;
    }
    delete(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
        }
    }
}
const content = fs.readFileSync(0, "utf8");
const lines = content.split('\n').filter(line => line.trim() !== '');
const [capacity, operations] = lines[0].split(' ').map(Number);
const cache = new LRUCache(capacity);
const putResults = [];
const getResults = [];
for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(' ');
    const command = parts[0];
    if (command === 'GET') {
        const key = parts[1];
        const value = cache.get(key) ?? -1;
        getResults.push(value);
    }
    else if (command === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (command === 'DEL') {
        const key = parts[1];
        cache.delete(key);
    }
}
let getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
let keys = [];
let current = cache.head;
while (current) {
    keys.push(current.key);
    current = current.next;
}
let keysOutput = keys.length > 0 ? keys.join(' ') : 'EMPTY';
console.log(getOutput);
console.log(keysOutput);
