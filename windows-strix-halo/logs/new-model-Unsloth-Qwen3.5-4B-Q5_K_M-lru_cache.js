"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
function solve() {
    const input = fs_1.default.readFileSync(0, 'utf8');
    const lines = input.split('\n');
    const linesData = lines.map(l => l.trim()).filter(l => l.length > 0);
    if (linesData.length === 0)
        return;
    const [C, N] = linesData[0].split(' ').map(Number);
    // Cache Map: key -> Node
    const map = new Map();
    // List pointers
    let head = null; // LRU end
    let tail = null; // MRU end
    // Wait, convention: Head is MRU or LRU?
    // Let's say Tail is MRU (Most Recently Used), Head is LRU (Least Recently Used).
    // Actually, usually Head is front. Let's make Tail MRU.
    // If Tail is MRU, we want to add new items to Tail.
    // If Head is LRU, we remove from Head when full.
    // Wait, let's standardize.
    // MRU: Tail. LRU: Head.
    // Add new -> add to Tail.
    // Move used -> move to Tail.
    // Evict -> remove from Head.
    const getMRU = () => tail;
    const getLRU = () => head;
    // Helper to add node to MRU end
    const addToMRU = (node) => {
        if (tail === null) {
            head = node;
            tail = node;
            node.prev = node; // Self loop if single? No, null/null is safer.
            // Let's handle empty list case carefully.
        }
        else if (tail === head) {
            // Single node
            tail = node;
            node.next = tail; // Points to itself? No, distinct nodes.
            tail.prev = node;
            node.next = null; // Wait, circular? No.
            // Correct logic for linked list:
            // head <-> node <-> tail
        }
    };
}
