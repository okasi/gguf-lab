class MinHeap<T> {
     private heap: T[] = [];
     private compare: (a: T, b: T) => boolean;

     constructor(compare: (a: T, b: T) => boolean) {
       this.compare = compare;
     }

     private swap(i: number, j: number) {
       [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
     }

     push(val: T) {
       this.heap.push(val);
       this.heapifyUp(this.heap.length - 1);
     }

     pop(): T | undefined {
       if (this.heap.length === 0) return undefined;
       const top = this.heap[0];
       const last = this.heap.pop()!;
       if (this.heap.length > 0) {
         this.heap[0] = last;
         this.heapifyDown(0);
       }
       return top;
     }

     size(): number {
       return this.heap.length;
     }

     private heapifyUp(idx: number) {
       while (idx > 0) {
         const parent = Math.floor((idx - 1) / 2);
         if (this.compare(this.heap[idx], this.heap[parent])) {
           this.swap(idx, parent);
           idx = parent;
         } else {
           break;
         }
       }
     }

     private heapifyDown(idx: number) {
       const length = this.heap.length;
       while (true) {
         let smallest = idx;
         const left = 2 * idx + 1;
         const right = 2 * idx + 2;
         if (left < length && this.compare(this.heap[left], this.heap[smallest])) {
           smallest = left;
         }
         if (right < length && this.compare(this.heap[right], this.heap[smallest])) {
           smallest = right;
         }
         if (smallest !== idx) {
           this.swap(idx, smallest);
           idx = smallest;
         } else {
           break;
         }
       }
     }
   }
