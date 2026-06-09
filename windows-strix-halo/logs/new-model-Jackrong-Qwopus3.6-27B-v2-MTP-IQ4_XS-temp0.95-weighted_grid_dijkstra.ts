import * as fs from 'fs';

class MinHeap {
  private heap: number[];
  private items: [number, number, number][]; // [cost, r, c]

  constructor() {
    this.heap = [];
    this.items = [];
  }

  push(cost: number, r: number, c: number): void {
    const item: [number, number, number] = [cost, r, c];
    this.items.push(item);
    this.heap.push(cost);
    // This is inefficient if costs are not unique. Let's just use a single array of tuples.
  }
}
