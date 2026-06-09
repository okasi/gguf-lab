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
const input = fs.readFileSync(0, "utf8");
const lines = input.trim().split("\n");
const [C, N] = lines[0].split(" ").map(Number);
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
        this.head = new Node("", -1);
        this.tail = new Node("", -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addToFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    remove(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
        node.prev = null;
        node.next = null;
    }
    removeLast() {
        if (this.tail.prev === this.head) {
            return null;
        }
        const last = this.tail.prev;
        this.remove(last);
        return last;
    }
    moveToFront(node) {
        this.remove(node);
        this.addToFront(node);
    }
    getKeys() {
        const keys = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
const cache = new Map();
const list = new DoublyLinkedList();
let capacity = C;
let size = 0;
const getResults = [];
for (let i = 1; i <= N; i++) {
    const parts = lines[i].split(" ");
    const operation = parts[0];
    const key = parts[1];
    const value = parts.length > 2 ? Number(parts[2]) : 0;
    if (operation === "GET") {
        if (cache.has(key)) {
            const node = cache.get(key);
            node.value = value;
            list.moveToFront(node);
            getResults.push(value);
        }
        else {
            getResults.push(-1);
        }
    }
    else if (operation === "PUT") {
        if (cache.has(key)) {
            const node = cache.get(key);
            node.value = value;
            list.moveToFront(node);
        }
        else {
            if (size === capacity) {
                const lru = list.removeLast();
                if (lru) {
                    cache.delete(lru.key);
                    size--;
                }
            }
            const newNode = new Node(key, value);
            list.addToFront(newNode);
            cache.set(key, newNode);
            size++;
        }
    }
    else if (operation === "DEL") {
        if (cache.has(key)) {
            const node = cache.get(key);
            list.remove(node);
            cache.delete(key);
            size--;
        }
    }
}
const output1 = getResults.length > 0 ? getResults.join(" ") : "EMPTY";
const output2 = list.getKeys().length > 0 ? list.getKeys().join(" ") : "EMPTY";
console.log(output1);
console.log(output2);
