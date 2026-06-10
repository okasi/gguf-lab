import * as fs from "fs";

function main(): void {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split("\n").filter(line => line.trim() !== "");
    
    if (lines.length === 0) {
        console.log("EMPTY\nEMPTY");
        return;
    }
    
    const firstLine = lines[0].split(" ").map(Number);
    const capacity = firstLine[0];
    const numOps = firstLine[1];
    
    // Doubly linked list node
    class Node {
        key: string;
        value: number;
        prev: Node | null = null;
        next: Node | null = null;
        
        constructor(key: string, value: number) {
            this.key = key;
            this.value = value;
        }
    }
    
    // Sentinel nodes for the doubly linked list
    const head = new Node("", 0); // Most recently used (before head is the most recent)
    const tail = new Node("", 0); // Least recently used (after tail is the least recent)
    head.next = tail;
    tail.prev = head;
    
    // Map from key to node for O(1) lookup
    const cache = new Map<string, Node>();
    
    // Helper to remove a node from the doubly linked list
    function removeNode(node: Node): void {
        const prev = node.prev;
        const next = node.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
    }
    
    // Helper to add a node to the front of the doubly linked list (most recently used)
    function addNodeToFront(node: Node): void {
        const next = head.next;
        head.next = node;
        node.prev = head;
        node.next = next;
        next.prev = node;
    }
    
    const getResults: number[] = [];
    
    for (let i = 1; i <= numOps; i++) {
        const parts = lines[i].split(" ");
        const operation = parts[0];
        const key = parts[1];
        
        if (operation === "GET") {
            const node = cache.get(key);
            if (node) {
                // Move to front (most recently used)
                removeNode(node);
                addNodeToFront(node);
                getResults.push(node.value);
            } else {
                getResults.push(-1);
            }
        } else if (operation === "PUT") {
            const value = parseInt(parts[2], 10);
            const existingNode = cache.get(key);
            
            if (existingNode) {
                // Update existing key: remove and re-add to front
                removeNode(existingNode);
                existingNode.value = value;
                addNodeToFront(existingNode);
            } else {
                // New key
                if (cache.size >= capacity) {
                    // Evict least recently used (node before tail)
                    const lruNode = tail.prev;
                    if (lruNode && lruNode !== tail) {
                        removeNode(lruNode);
                        cache.delete(lruNode.key);
                    }
                }
                const newNode = new Node(key, value);
                addNodeToFront(newNode);
                cache.set(key, newNode);
            }
        } else if (operation === "DEL") {
            const node = cache.get(key);
            if (node) {
                removeNode(node);
                cache.delete(key);
            }
        }
    }
    
    // Output GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(getResults.join(" "));
    }
    
    // Output remaining keys from most recently used to least recently used
    const remainingKeys: string[] = [];
    let current = head.next;
    while (current && current !== tail) {
        remainingKeys.push(current.key);
        current = current.next;
    }
    
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    } else {
        console.log(remainingKeys.join(" "));
    }
}

main();
