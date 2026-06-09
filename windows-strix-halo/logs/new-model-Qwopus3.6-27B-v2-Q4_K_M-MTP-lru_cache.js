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
function main() {
    const data = fs.readFileSync(0, 'utf8').trim();
    const lines = data.split(/\r?\n/);
    const firstLineParts = lines[0].split(/\s+/);
    const C = parseInt(firstLineParts[0], 10);
    const N = parseInt(firstLineParts[1], 10);
    const head = new Node('', 0);
    const tail = new Node('', 0);
    head.next = tail;
    tail.prev = head;
    const map = new Map();
    let size = 0;
    function moveToFront(node) {
        if (node.prev)
            node.prev.next = node.next;
        if (node.next)
            node.next.prev = node.prev;
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }
    function removeNode(node) {
        if (node.prev)
            node.prev.next = node.next;
        if (node.next)
            node.next.prev = node.prev;
    }
    function get(key) {
        if (!map.has(key))
            return -1;
        const node = map.get(key);
        moveToFront(node);
        return node.value;
    }
    function put(key, value) {
        if (map.has(key)) {
            const node = map.get(key);
            node.value = value;
            moveToFront(node);
            return;
        }
        if (size === C) {
            const lru = tail.prev;
            if (lru && lru !== head) {
                removeNode(lru);
                map.delete(lru.key);
                size--;
            }
        }
        const newNode = new Node(key, value);
        newNode.prev = head;
        newNode.next = head.next;
        head.next.prev = newNode;
        head.next = newNode;
        map.set(key, newNode);
        size++;
    }
    function del(key) {
        if (!map.has(key))
            return;
        const node = map.get(key);
        removeNode(node);
        map.delete(key);
        size--;
    }
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        if (cmd === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            put(key, value);
        }
        else if (cmd === 'GET') {
            const key = parts[1];
            const result = get(key);
            getResults.push(result);
        }
        else if (cmd === 'DEL') {
            const key = parts[1];
            del(key);
        }
    }
    let firstLineOut;
    if (getResults.length > 0) {
        firstLineOut = getResults.join(' ');
    }
    else {
        firstLineOut = 'EMPTY';
    }
    const keys = [];
    let current = head.next;
    while (current !== tail) {
        keys.push(current.key);
        current = current.next;
    }
    let secondLineOut;
    if (keys.length > 0) {
        secondLineOut = keys.join(' ');
    }
    else {
        secondLineOut = 'EMPTY';
    }
    console.log(firstLineOut);
    console.log(secondLineOut);
}
main();
