class Node {
     key: string;
     value: number;
     prev: Node | null;
     next: Node | null;
   }

   We'll have:
     head: Node | null;   // most recently used
     tail: Node | null;   // least recently used

   But to make it easier, we can use dummy nodes for head and tail.

   Alternatively, we can use a simpler approach: 
     We'll have a doubly linked list with a dummy head and dummy tail.

   However, note that we need to output the keys in order from most recently used to least recently used, which is from head to tail.

   Steps for the list:

   Initialize:
     dummyHead = new Node('', 0, null, null);   // dummy head for the list
     dummyTail = new Node('', 0, null, null);   // dummy tail for the list
     dummyHead.next = dummyTail;
     dummyTail.prev = dummyHead;
     size = 0;

   Add to head (most recently used):
     node = new Node(key, value, null, null);
     node.prev = dummyHead;
     node.next = dummyHead.next;
     dummyHead.next = node;
     node.next.prev = node;

   Remove from tail (least recently used):
     node = dummyTail.prev;
     node.prev.next = node.next;
     node.next.prev = node.prev;
     size--;

   Remove a node by reference:
     node.prev.next = node.next;
     node.next.prev = node.prev;

   Move a node to the head:
     Remove the node from its current position.
     Then add it to the head.

   But note: When we update an existing key, we remove the old node and then add a new one at the head.

   Alternatively, we can update the value and then move the node to the head.

   We'll do:

     If the key exists:
       Remove the node from the list.
       Create a new node (or update the old one) and add it to the head.

   However, we can update the value and then move the node to the head.

   But note: We are storing the value in the node. We can update the value and then move the node to the head.

   Steps for PUT:
     If the key exists:
       Let node = map.get(key);
       node.value = value;
       Move the node to the head.

     Else:
       If size == capacity, remove the tail (least recently used).
       Create a new node and add it at the head.
       Map.put(key, node);
       size++;

   Steps for GET:
     If the key exists:
       Let node = map.get(key);
       Move the node to the head.
       Return node.value.

     Else:
       Return -1.

   Steps for DEL:
     If the key exists:
       Let node = map.get(key);
       Remove the node from the list.
       Delete from map.
       size--;

   How to move a node to the head:

     Remove the node from the list (using removeNode):
       node.prev.next = node.next;
       node.next.prev = node.prev;

     Then add the node to the head:
       node.prev = dummyHead;
       node.next = dummyHead.next;
       dummyHead.next = node;
       node.next.prev = node;

   But note: When we remove the node, we don't need to remove from the map because we are updating the value and then we are going to add it again? 
   Actually, we are updating the value and then moving the node to the head. So we don't remove from the map.

   However, when we add a new node, we remove from the map the old one? No, we are updating the existing one.

   Actually, when we update an existing key, we are not removing and adding a new node. We are just updating the value and then moving the node to the head.

   But wait: In the doubly linked list, the node is the same. So we can update the value and then move the node to the head.

   However, note: When we move the node to the head, we are removing it from its current position and adding it at the head.

   So:

     Move to head:
       Remove the node from the list (so it becomes disconnected).
       Then insert it at the head.

   But note: The node is already in the list? Yes. So we remove it and then add it at the head.

   However, we must be cautious: When we remove the node from the list, we don't change the map. We only change the list.

   Steps for moving a node to the head:

     Step 1: Remove the node from the list.
       node.prev.next = node.next;
       node.next.prev = node.prev;

     Step 2: Insert the node at the head.
       node.prev = dummyHead;
       node.next = dummyHead.next;
       dummyHead.next = node;
       node.next.prev = node;

   But note: When we remove the node, we must update the next and prev pointers. However, if the node is the head (most recently used) then we don't need to do anything? Actually, we are moving it to the head, so if it is already at the head, we don't need to move. But we can still do the removal and insertion, but it will be the same.

   Alternatively, we can check if the node is already at the head, then skip.

   However, for simplicity, we can always remove and then insert. But note: if we remove a node that is already at the head, then we are removing the head and then inserting it again. That might cause a problem because the dummyHead.next is set to the node again.

   Let's trace:

     Suppose we have: dummyHead <-> node1 <-> dummyTail.

     If we remove node1 from the list (by setting node1.prev.next = node1.next -> dummyHead.next = dummyTail; and dummyTail.prev = dummyHead;), then we insert node1 at the head:

        node1.prev = dummyHead;
        node1.next = dummyHead.next; // which is now dummyTail
        dummyHead.next = node1;
        dummyTail.prev = node1;

     So it becomes: dummyHead <-> node1 <-> dummyTail.

     So it works.

   But note: We are updating the pointers in the list. We must be cautious to not break the list.

   Alternatively, we can have a function to remove a node and then a function to add a node at the head.

   However, we can do:

     removeNode(node) {
       node.prev.next = node.next;
       node.next.prev = node.prev;
     }

     addNodeAtHead(node) {
       node.prev = dummyHead;
       node.next = dummyHead.next;
       dummyHead.next = node;
       node.next.prev = node;
     }

   Then moveNodeToHead(node) {
     this.removeNode(node);
     this.addNodeAtHead(node);
   }

   But note: When we remove the node, we are removing it from the list. Then we add it at the head.

   However, we must be cautious: if the node is already at the head, then removing it will set dummyHead.next to dummyTail, and then adding it at the head will set dummyHead.next to the node and node.next to dummyTail. So it becomes the same.

   So we can do:

     if (node === dummyHead.next) {
       // already at head, no need to move
     } else {
       this.removeNode(node);
       this.addNodeAtHead(node);
     }

   This might save some pointer operations.

   Similarly, when we add a new node, we can do:

     addNodeAtHead(node) {
       node.prev = dummyHead;
       node.next = dummyHead.next;
       dummyHead.next = node;
       node.next.prev = node;
     }

   But note: If the list is empty (only dummyHead and dummyTail), then dummyHead.next is dummyTail, so it will work.

   Now, we have to handle the GET and PUT and DEL.

   We'll have:

     map: Map<string, Node>;
     dummyHead: Node;
     dummyTail: Node;
     size: number;
     capacity: number;

   Initialize:
     dummyHead = new Node('', 0, null, null);
     dummyTail = new Node('', 0, null, null);
     dummyHead.next = dummyTail;
     dummyTail.prev = dummyHead;
     size = 0;

   Then, for each operation:

     PUT key value:
       if (map.has(key)) {
         const node = map.get(key)!;
         node.value = value;
         // Move to head
         if (node !== dummyHead.next) {
           this.removeNode(node);
           this.addNodeAtHead(node);
         }
       } else {
         if (size === capacity) {
           // Remove the tail
           const last = dummyTail.prev;
           if (last !== dummyHead) { // if the cache is not empty
             this.removeNode(last);
             map.delete(last.key);
             size--;
           }
         }
         const node = new Node(key, value, null, null);
         this.addNodeAtHead(node);
         map.set(key, node);
         size++;
       }

     GET key:
       if (map.has(key)) {
         const node = map.get(key)!;
         if (node !== dummyHead.next) {
           this.removeNode(node);
           this.addNodeAtHead(node);
         }
         results.push(node.value);
       } else {
         results.push(-1);
       }

     DEL key:
       if (map.has(key)) {
         const node = map.get(key)!;
         this.removeNode(node);
         map.delete(key);
         size--;
       }

   After processing all operations, we need to output:

     First line: all GET results separated by spaces, or EMPTY if there were no GET operations.
        We collected the results in an array `results` during the simulation.

     Second line: remaining keys from most-recently-used to least-recently-used.
        We can traverse from dummyHead.next to dummyTail.prev (until we hit dummyTail) and collect the keys.

        If the cache is empty (dummyHead.next === dummyTail), then output EMPTY.

   However, note: We are using a doubly linked list with dummy nodes. So the actual nodes are between dummyHead and dummyTail.

   Steps for traversing:

     let current = dummyHead.next;
     let keys = [];
     while (current !== dummyTail) {
       keys.push(current.key);
       current = current.next;
     }

   Then, if keys.length === 0, output EMPTY, else output keys.join(' ').

   But note: The problem says "remaining keys from most-recently-used to least-recently-used", which is from the head (most recently used) to the tail (least recently used).

   However, in our list, the head (dummyHead.next) is the most recently used and the tail (dummyTail.prev) is the least recently used.

   So the order is from dummyHead.next to dummyTail.prev.

   But note: The list is: dummyHead <-> [most recently used] <-> ... <-> [least recently used] <-> dummyTail.

   So we can traverse from dummyHead.next until we hit dummyTail.

   But wait: What if the cache is empty? Then dummyHead.next === dummyTail, so the while loop will not run and we get an empty array.

   So we can do:

     if (dummyHead.next === dummyTail) {
       console.log("EMPTY");
     } else {
       console.log(keys.join(' '));
     }

   However, we must be cautious: We are storing the keys in the nodes. We need to output the keys, not the values.

   But note: The problem says "remaining keys", so we output the keys.

   However, the problem does not specify the order for the second line? It says "from most-recently-used to least-recently-used", which is the order of the list.

   But note: The problem says "remaining keys", meaning the keys that are currently in the cache.

   So we output the keys in the order of the list.

   However, we must note: The problem says "separated by spaces".

   Now, we have to read the input.

   Steps for reading:

     const input = fs.readFileSync(0, "utf8");
     const lines = input.trim().split('\n');

     The first line: C N
     Then N lines.

   But note: The constraints: N up to 300000, so we must be efficient.

   We'll process each line.

   However, we must be cautious: The input might have empty lines? The problem says first line: C N, then N lines.

   We can do:

     const firstLine = lines[0].trim();
     const [capacity, n] = firstLine.split(' ').map(Number);

     Then, for i from 1 to n, we take lines[i].

   But note: There might be empty lines? We should skip empty lines? The problem says next N lines, so we can assume they are not empty.

   However, we can do:

     for (let i = 1; i <= n; i++) {
       const line = lines[i].trim();
       if (line === '') continue; // skip empty lines? But the problem says next N lines, so we might not have empty lines.

       // But to be safe, we can skip empty lines.

       const parts = line.split(' ');
       const op = parts[0];
       const key = parts[1];
       const value = parts.length > 2 ? Number(parts[2]) : null;

       if (op === 'PUT') {
         // key and value are provided
         // value is a signed 32-bit integer
         this.put(key, value);
       } else if (op === 'GET') {
         this.get(key);
       } else if (op === 'DEL') {
         this.del(key);
       }
     }

   But note: The problem says keys are non-empty strings without spaces. So we can split by space.

   However, the PUT operation has two arguments: key and value. The value is a number.

   We'll parse the value as an integer.

   But note: The value is a signed 32-bit integer. We can use Number.parseInt(valueString, 10) to avoid octal issues.

   Alternatively, we can use Number(valueString) but it might have issues with leading zeros. But the problem says signed 32-bit integer, so it should be a valid integer string.

   We'll use Number() but note: Number("01") is 1, which is correct. But if it's negative, it's fine.

   However, we can use parseInt to be safe.

   But note: The problem says values are signed 32-bit integers, so they are within the range.

   We'll do:

     const value = Number(parts[2]);

   Now, we'll implement the LRU cache.

   However, we are writing a complete TypeScript program. We must define the Node class and the LRU class.

   But note: We are going to read from stdin and write to stdout.

   We'll write the entire program.

   Let's code accordingly.

   Important: We are using Node.js, so we can use fs.

   We'll import fs.

   We'll define the Node class:

     class Node {
       key: string;
       value: number;
       prev: Node | null;
       next: Node | null;

       constructor(key: string, value: number, prev: Node | null, next: Node | null) {
         this.key = key;
         this.value = value;
         this.prev = prev;
         this.next = next;
       }
     }

   But note: We don't need the value for the dummy nodes? We can set to 0 and key to empty.

   Now, we'll implement the LRU class:

     class LRUCache {
       private capacity: number;
       private size: number;
       private map: Map<string, Node>;
       private dummyHead: Node;
       private dummyTail: Node;

       constructor(capacity: number) {
         this.capacity = capacity;
         this.size = 0;
         this.map = new Map();
         this.dummyHead = new Node('', 0, null, null);
         this.dummyTail = new Node('', 0, null, null);
         this.dummyHead.next = this.dummyTail;
         this.dummyTail.prev = this.dummyHead;
       }

       private removeNode(node: Node) {
         node.prev.next = node.next;
         node.next.prev = node.prev;
       }

       private addNodeAtHead(node: Node) {
         node.prev = this.dummyHead;
         node.next = this.dummyHead.next;
         this.dummyHead.next = node;
         node.next.prev = node;
       }

       private moveNodeToHead(node: Node) {
         if (node !== this.dummyHead.next) {
           this.removeNode(node);
           this.addNodeAtHead(node);
         }
       }

       put(key: string, value: number) {
         if (this.map.has(key)) {
           const node = this.map.get(key)!;
           node.value = value;
           this.moveNodeToHead(node);
         } else {
           if (this.size === this.capacity) {
             // Remove the tail
             const last = this.dummyTail.prev;
             if (last !== this.dummyHead) { // if the cache is not empty
               this.removeNode(last);
               this.map.delete(last.key);
               this.size--;
             }
           }
           const node = new Node(key, value, null, null);
           this.addNodeAtHead(node);
           this.map.set(key, node);
           this.size++;
         }
       }

       get(key: string): number {
         if (this.map.has(key)) {
           const node = this.map.get(key)!;
           this.moveNodeToHead(node);
           return node.value;
         } else {
           return -1;
         }
       }

       delete(key: string): void {
         if (this.map.has(key)) {
           const node = this.map.get(key)!;
           this.removeNode(node);
           this.map.delete(key);
           this.size--;
         }
       }

       getKeys(): string[] {
         const keys: string[] = [];
         let current = this.dummyHead.next;
         while (current !== this.dummyTail) {
           keys.push(current.key);
           current = current.next;
         }
         return keys;
       }
     }

   Then, in the main:

     import * as fs from 'fs';

     const input = fs.readFileSync(0, "utf8");
     const lines = input.trim().split('\n');

     if (lines.length < 1) {
       // No input? But the problem says first line is C N.
       console.log("EMPTY");
       console.log("EMPTY");
       return;
     }

     const firstLine = lines[0].trim();
     const parts = firstLine.split(' ');
     const capacity = Number(parts[0]);
     const n = Number(parts[1]);

     const cache = new LRUCache(capacity);
     const results: number[] = [];

     for (let i = 1; i <= n; i++) {
       const line = lines[i].trim();
       if (line === '') continue;

       const opParts = line.split(' ');
       const op = opParts[0];

       if (op === 'PUT') {
         const key = opParts[1];
         const value = Number(opParts[2]);
         cache.put(key, value);
       } else if (op === 'GET') {
         const key = opParts[1];
         const res = cache.get(key);
         results.push(res);
       } else if (op === 'DEL') {
         const key = opParts[1];
         cache.delete(key);
       }
     }

     // Output the GET results
     if (results.length === 0) {
       console.log("EMPTY");
     } else {
       console.log(results.join(' '));
     }

     // Output the remaining keys
     const keys = cache.getKeys();
     if (keys.length === 0) {
       console.log("EMPTY");
     } else {
       console.log(keys.join(' '));
     }

   However, note: The problem says the first line of output is the GET results, and the second line is the remaining keys.

   But wait: The problem says "First line: all GET results separated by spaces, or EMPTY if there were no GET operations."

   So we output the GET results first, then the remaining keys.

   But note: The GET results are collected during the simulation and then output at the end.

   This should work.

   However, we must be cautious: The input might have more than n+1 lines? The problem says next N lines, so we can assume there are exactly n lines after the first.

   But what if there are empty lines? We skip empty lines.

   Also, note: The keys and values are non-empty. So we don't have to worry about missing arguments.

   But note: The PUT operation must have two arguments. The GET and DEL must have one.

   We'll assume the input is well-formed.

   Let's test with a small example.

   Example:
     Input:
       3 6
       PUT 1 10
       PUT 2 20
       GET 1
       PUT 3 30
       GET 2
       DEL 1

     Steps:
       Capacity=3, operations=6.

       PUT 1 10: cache has {1:10}, keys: [1]
       PUT 2 20: cache has {1:10, 2:20}, keys: [2,1]  (most recently used first: 2 then 1)
       GET 1: returns 10, and moves 1 to head -> keys: [1,2]  (1 is now most recently used, then 2)
       PUT 3 30: cache is not full (size=2 < 3), so add 3 at head -> keys: [3,1,2]
       GET 2: returns 20, and moves 2 to head -> keys: [2,3,1]  (2 is most recently used, then 3, then 1)
       DEL 1: remove 1 -> keys: [2,3]

     Output:
       First line: GET results: 10 and 20 -> "10 20"
       Second line: remaining keys: [2,3] -> "2 3"

   But note: The order of the keys in the output for the second line is from most recently used to least recently used.

   In our list, after DEL 1, the list is: dummyHead <-> 2 <-> 3 <-> dummyTail.

   So we get keys: ["2", "3"] -> output "2 3".

   However, the example output might be expected as "2 3" or "3 2"? 

   The problem says: "remaining keys from most-recently-used to least-recently-used"

   After the last operation (DEL 1), the cache has:
     2 was just accessed (in GET 2) so it is the most recently used.
     3 was just added (in PUT 3) so it is the second most recently used? Actually, after PUT 3, the order was [3,1,2]. Then we moved 2 to the head, so the order became [2,3,1]. Then we removed 1, so the order is [2,3].

   So the most recently used is 2, then 3.

   So we output "2 3".

   But note: In the list, the head (most recently used) is 2, then 3, then the tail (least recently used) is 3? Actually, the list is:

     dummyHead <-> 2 <-> 3 <-> dummyTail.

   So when we traverse from dummyHead.next to dummyTail, we get 2 then 3.

   So it's correct.

   However, we must be cautious: The problem says "from most-recently-used to least-recently-used", which is the order we traverse.

   So we output the keys in the order they appear from the head to the tail.

   Now, we write the code.

   But note: We are using a Map for the nodes. The map is for O(1) access by key.

   We are using a doubly linked list for O(1) removal and insertion.

   This should be O(1) amortized per operation.

   However, the moveNodeToHead operation is O(1) because we are just moving pointers.

   Let's code accordingly.

   One more thing: We must not use /dev/stdin. We are using fs.readFileSync(0, "utf8").

   We'll write the entire program.

   Note: We must not output extra spaces. We use join(' ') for the arrays.

   We'll write the code.

   IMPORTANT: We must not output any extra text. Only the two lines.

   We'll write the code accordingly.

   However, note: The problem says the values are signed 32-bit integers. We are using Number, which is 64-bit floating point. But for integers within the 32-bit signed range, it's safe.

   But note: The problem does not specify the range of keys. They are non-empty strings without spaces.

   We'll use string as keys.

   Let's code.

   We'll define the Node class and the LRUCache class.

   We'll put everything in one file.

   We'll import fs.

   We'll write the main function.

   We'll use process.stdin? No, we are reading from fd0.

   We'll do:

     import * as fs from 'fs';

   But note: In TypeScript, we can use 'import' statement.

   However, we are writing a Node.js program. We can use CommonJS or ES modules.

   Since we are writing a complete program, we can use ES modules if we set the type in package.json, but the problem does not specify.

   Alternatively, we can use CommonJS: const fs = require('fs');

   But the problem says TypeScript program. We can use ES6 modules if we set the module type.

   However, the problem does not specify. We can use either.

   But note: The problem says "Write a complete TypeScript program for Node.js", so we can choose.

   Let's use ES6 modules.

   We'll set the module to "ESNext" or "ES2020". But the problem does not specify.

   Alternatively, we can use CommonJS to avoid configuration.

   Since the problem does not specify, and to be safe, we can use CommonJS.

   But note: The problem says "Return only TypeScript code", so we can write in TypeScript and then compile.

   However, we are writing the code in TypeScript and we assume it will be compiled with TypeScript.

   We'll write in TypeScript with ES6 modules? Or CommonJS?

   The problem does not specify. We can use either.

   But note: The problem says "Node.js", and Node.js supports both.

   However, we are reading from stdin, which is available in both.

   We'll use ES6 modules because it's more modern.

   But we must set the module type in tsconfig.json? The problem does not say we are providing tsconfig.

   We can write in a way that works in both.

   Alternatively, we can use the CommonJS require.

   Since the problem does not specify, and to avoid configuration, we can use:

     const fs = require('fs');

   But in TypeScript, we need to declare the type.

   We can do:

     import * as fs from 'fs';

   This will work in both ES6 and CommonJS if we set the module appropriately.

   But if we don't set the module, then the TypeScript compiler will use CommonJS by default.

   So we'll write:

     import * as fs from 'fs';

   And then in the tsconfig.json, we set "module": "commonjs", which is default.

   But the problem does not require us to provide tsconfig.

   We'll write the code and assume it will be compiled with TypeScript.

   Now, the code.

   Note: We must not output any extra text. Only the two lines.

   We'll write the code accordingly.

   However, we must be cautious: The problem says the first line of output is the GET results, and the second line is the remaining keys.

   We output:

     console.log(results.join(' '));   // or "EMPTY"
     console.log(keys.join(' '));      // or "EMPTY"

   But note: If there are no GET operations, we output "EMPTY
