interface Node {
       key: string;
       value: number;
       prev: Node | null;
       next: Node | null;
   }

   class LRUCache {
       private capacity: number;
       private map: Map<string, Node>;
       private head: Node;
       private tail: Node;
       private size: number;

       constructor(capacity: number) {
           this.capacity = capacity;
           this.map = new Map();
           this.head = { key: '', value: 0, prev: null, next: null };
           this.tail = { key: '', value: 0, prev: null, next: null };
           this.head.next = this.tail;
           this.tail.prev = this.head;
           this.size = 0;
       }

       private addToHead(node: Node) {
           node.prev = this.head;
           node.next = this.head.next;
           this.head.next!.prev = node;
           this.head.next = node;
       }

       private removeNode(node: Node) {
           const prev = node.prev!;
           const next = node.next!;
           prev.next = next;
           next.prev = prev;
       }

       private removeTail(): Node {
           const node = this.tail.prev!;
           this.removeNode(node);
           return node;
       }

       get(key: string): number {
           const node = this.map.get(key);
           if (!node) return -1;
           this.removeNode(node);
           this.addToHead(node);
           return node.value;
       }

       put(key: string, value: number): void {
           const existing = this.map.get(key);
           if (existing) {
               existing.value = value;
               this.removeNode(existing);
               this.addToHead(existing);
               return;
           }

           if (this.size >= this.capacity) {
               const lru = this.removeTail();
               this.map.delete(lru.key);
               this.size--;
           }

           const newNode: Node = { key, value, prev: null, next: null };
           this.addToHead(newNew);
           this.map.set(key, newNode);
           this.size++;
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
           while (curr && curr !== this.tail) {
               keys.push(curr.key);
               curr = curr.next;
           }
           return keys;
       }
   }
