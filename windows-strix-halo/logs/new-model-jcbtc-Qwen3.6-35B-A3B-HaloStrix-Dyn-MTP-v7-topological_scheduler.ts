import * as fs from "fs";

   // Binary Min-Heap for strings
   class MinHeap {
     private data: string[] = [];

     push(item: string): void {
       this.data.push(item);
       this.bubbleUp(this.data.length - 1);
     }

     pop(): string | undefined {
       if (this.data.length === 0) return undefined;
       const top = this.data[0];
       const last = this.data.pop()!;
       if (this.data.length > 0) {
         this.data[0] = last;
         this.bubbleDown(0);
       }
       return top;
     }

     peek(): string | undefined {
       return this.data[0];
     }

     get size(): number {
       return this.data.length;
     }

     isEmpty(): boolean {
       return this.data.length === 0;
     }

     private bubbleUp(idx: number): void {
       const arr = this.data;
       while (idx > 0) {
         const parentIdx = (idx - 1) >> 1;
         if (arr[parentIdx] <= arr[idx]) break;
         [arr[parentIdx], arr[idx]] = [arr[idx], arr[parentIdx]];
         idx = parentIdx;
       }
     }

     private bubbleDown(idx: number): void {
       const arr = this.data;
       const n = arr.length;
       while (true) {
         let smallest = idx;
         const left = 2 * idx + 1;
         const right = 2 * idx + 2;

         if (left < n && arr[left] < arr[smallest]) smallest = left;
         if (right < n && arr[right] < arr[smallest]) smallest = right;

         if (smallest === idx) break;
         [arr[smallest], arr[idx]] = [arr[idx], arr[smallest]];
         idx = smallest;
       }
     }
   }

   function solve(): void {
     const input = fs.readFileSync(0, "utf8").trim();
     if (!input) return;

     const lines = input.split(/\n/);
     const [nStr, mStr] = lines[0].split(/\s+/);
     const N = parseInt(nStr);
     const M = parseInt(mStr);

     const tasks = lines[1].split(/\s+/);
     const adj: Map<string, string[]> = new Map();
     const inDegree: Map<string, number> = new Map();

     for (const task of tasks) {
       adj.set(task, []);
       inDegree.set(task, 0);
     }

     for (let i = 0; i < M; i++) {
       const parts = lines[2 + i].split(/\s+/);
       const u = parts[0];
       const v = parts[1];
       if (!adj.has(u)) adj.set(u, []);
       if (!adj.has(v)) adj.set(v, []);
       adj.get(u)!.push(v);
       inDegree.set(v, (inDegree.get(v) || 0) + 1);
     }

     const pq = new MinHeap();
     for (const task of tasks) {
       if (inDegree.get(task) === 0) {
         pq.push(task);
       }
     }

     const result: string[] = [];
     while (!pq.isEmpty()) {
       const u = pq.pop()!;
       result.push(u);
       const neighbors = adj.get(u) || [];
       for (const v of neighbors) {
         const deg = inDegree.get(v)!;
         if (deg === 1) {
           inDegree.set(v, 0);
           pq.push(v);
         } else {
           inDegree.set(v, deg - 1);
         }
       }
     }

     if (result.length < N) {
       console.log("IMPOSSIBLE");
     } else {
       console.log(result.join(" "));
     }
   }

   solve();
