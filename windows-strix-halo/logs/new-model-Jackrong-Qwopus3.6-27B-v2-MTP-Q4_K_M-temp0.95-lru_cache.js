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
function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input)
        return;
    const lines = input.split('\n');
    const [C_str, N_str] = lines[0].split(/\s+/);
    const capacity = parseInt(C_str, 10);
    // N is not strictly needed, but we can use it for loop bound
    const head = { key: '', value: 0, prev: null, next: null };
    const tail = { key: '', value: 0, prev: null, next: null };
    head.next = tail;
    tail.prev = head;
    const map = new Map();
    function addAfterHead(node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
    function removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    function moveToFront(node) {
        removeNode(node);
        addAfterHead(node);
    }
    const getResults = [];
    // Process commands
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        const key = parts[1];
        if (cmd === 'PUT') {
            const value = parseInt(parts[2], 10);
            if (map.has(key)) {
                const node = map.get(key);
                node.value = value;
                moveToFront(node);
            }
            else {
                const newNode = { key, value, prev: null, next: null };
                addAfterHead(newNode);
                map.set(key, newNode);
                if (map.size > capacity) {
                    const evictedNode = tail.prev;
                    if (evictedNode !== head) {
                        removeNode(evictedNode);
                        map.delete(evictedNode.key);
                    }
                }
            }
        }
        else if (cmd === 'GET') {
            if (map.has(key)) {
                const node = map.get(key);
                getResults.push(node.value);
                moveToFront(node);
            }
            else {
                getResults.push(-1);
            }
        }
        else if (cmd === 'DEL') {
            if (map.has(key)) {
                const node = map.get(key);
                removeNode(node);
                map.delete(key);
            }
        }
    }
    // Output GET results
    const firstLine = getResults.length === 0 ? 'EMPTY' : getResults.join(' ');
    console.log(firstLine);
    // Output remaining keys from most recent to least recent
    const keys = [];
    let curr = head.next;
    while (curr !== tail) {
        keys.push(curr.key);
        curr = curr.next;
    }
    const secondLine = keys.length === 0 ? 'EMPTY' : keys.join(' ');
    console.log(secondLine);
}
main();
