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

   class LRUCache {
     capacity: number;
     map: Map<string, Node>;
     head: Node; // dummy head
     tail: Node; // dummy tail
     size: number;

     constructor(capacity: number) {
       this.capacity = capacity;
       this.map = new Map();
       this.head = new Node("", 0);
       this.tail = new Node("", 0);
       this.head.next = this.tail;
       this.tail.prev = this.head;
       this.size = 0;
     }

     // Move node to front (most recently used)
     moveToFront(node: Node): void {
       this.removeNode(node);
       this.insertAfterHead(node);
     }

     removeNode(node: Node): void {
       node.prev!.next = node.next;
       node.next!.prev = node.prev;
     }

     insertAfterHead(node: Node): void {
       node.next = this.head.next;
       node.prev = this.head;
       this.head.next!.prev = node;
       this.head.next = node;
     }

     get(key: string): number | undefined {
       const node = this.map.get(key);
       if (!node) return undefined;
       this.moveToFront(node);
       return node.value;
     }

     put(key: string, value: number): void {
       const node = this.map.get(key);
       if (node) {
         node.value = value;
         this.moveToFront(node);
       } else {
         const newNode = new Node(key, value);
         this.map.set(key, newNode);
         this.insertAfterHead(newNode);
         this.size++;
         if (this.size > this.capacity) {
           const lruNode = this.tail.prev!;
           this.removeNode(lruNode);
           this.map.delete(lruNode.key);
           this.size--;
         }
       }
     }

     del(key: string): void {
       const node = this.map.get(key);
       if (node) {
         this.removeNode(node);
         this.map.delete(key);
         this.size--;
       }
     }

     getKeysMRUtoLRU(): string[] {
       const keys: string[] = [];
       let curr = this.head.next;
       while (curr !== this.tail) {
         keys.push(curr.key);
         curr = curr.next;
       }
       return keys;
     }
   }
