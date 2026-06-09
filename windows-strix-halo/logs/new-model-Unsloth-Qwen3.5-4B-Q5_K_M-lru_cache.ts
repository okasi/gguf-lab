import fs from 'fs';

    class Node {
        key: string;
        value: number;
        prev: Node | null;
        next: Node | null;

        constructor(key: string, value: number) {
            this.key = key;
            this.value = value;
            this.prev = null;
            this.next = null;
        }
    }

    function solve() {
        const input = fs.readFileSync(0, 'utf8');
        const lines = input.split('\n');
        const linesData = lines.map(l => l.trim()).filter(l => l.length > 0);

        if (linesData.length === 0) return;

        const [C, N] = linesData[0].split(' ').map(Number);
        
        // Cache Map: key -> Node
        const map = new Map<string, Node>();
        // List pointers
        let head: Node | null = null; // LRU end
        let tail: Node | null = null; // MRU end
        
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
        const addToMRU = (node: Node) => {
            if (tail === null) {
                head = node;
                tail = node;
                node.prev = node; // Self loop if single? No, null/null is safer.
                // Let's handle empty list case carefully.
            } else if (tail === head) {
                // Single node
                tail = node;
                node.next = tail; // Points to itself? No, distinct nodes.
                tail.prev = node;
                node.next = null; // Wait, circular? No.
                // Correct logic for linked list:
                // head <-> node <-> tail
            }
        }
    }
