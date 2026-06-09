class PriorityQueue {
       private heap: [number, number, number][] = []; // [cost, r, c]
       private compare = (a: [number, number, number], b: [number, number, number]) => a[0] < b[0];

       push(item: [number, number, number]) {
           this.heap.push(item);
           this.bubbleUp(this.heap.length - 1);
       }

       pop(): [number, number, number] | undefined {
           if (this.heap.length === 0) return undefined;
           const top = this.heap[0];
           const bottom = this.heap.pop();
           if (this.heap.length > 0 && bottom) {
               this.heap[0] = bottom;
               this.bubbleDown(0);
           }
           return top;
       }

       bubbleUp(index: number) {
           const element = this.heap[index];
           while (index > 0) {
               const parentIndex = Math.floor((index - 1) / 2);
               const parent = this.heap[parentIndex];
               if (this.compare(element, parent)) {
                   this.heap[parentIndex] = element;
                   this.heap[index] = parent;
                   index = parentIndex;
               } else {
                   break;
               }
           }
       }

       bubbleDown(index: number) {
           const length = this.heap.length;
           const element = this.heap[index];
           while (true) {
               const leftChildIndex = 2 * index + 1;
               const rightChildIndex = 2 * index + 2;
               let swapIndex = -1;
               if (leftChildIndex < length) {
                   if (this.compare(this.heap[leftChildIndex], element)) {
                       swapIndex = leftChildIndex;
                   }
               }
               if (rightChildIndex < length) {
                   if (this.compare(this.heap[rightChildIndex], swapIndex === -1 ? element : this.heap[swapIndex])) {
                       swapIndex = rightChildIndex;
                   }
               }
               if (swapIndex === -1) break;
               this.heap[index] = this.heap[swapIndex];
               this.heap[swapIndex] = element;
               index = swapIndex;
           }
       }

       isEmpty(): boolean {
           return this.heap.length === 0;
       }
   }
