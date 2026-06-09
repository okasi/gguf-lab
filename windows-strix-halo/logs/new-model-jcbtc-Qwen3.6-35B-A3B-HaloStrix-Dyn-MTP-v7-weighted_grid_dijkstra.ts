class MinHeap {
     data: [number, number, number][]; // [cost, r, c]
     constructor() { this.data = []; }
     push(item: [number, number, number]) {
       this.data.push(item);
       this.bubbleUp(this.data.length - 1);
     }
     pop(): [number, number, number] {
       if (this.data.length === 0) return null as any;
       const top = this.data[0];
       const last = this.data.pop()!;
       if (this.data.length > 0) {
         this.data[0] = last;
         this.sinkDown(0);
       }
       return top;
     }
     get size() { return this.data.length; }
     private bubbleUp(i: number) {
       while (i > 0) {
         const parent = (i - 1) >> 1;
         if (this.data[i][0] < this.data[parent][0]) {
           [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
           i = parent;
         } else break;
       }
     }
     private sinkDown(i: number) {
       const n = this.data.length;
       while (true) {
         let left = 2 * i + 1;
         let right = 2 * i + 2;
         let smallest = i;
         if (left < n && this.data[left][0] < this.data[smallest][0]) smallest = left;
         if (right < n && this.data[right][0] < this.data[smallest][0]) smallest = right;
         if (smallest !== i) {
           [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
           i = smallest;
         } else break;
       }
     }
   }
