import * as fs from 'fs';

class MinPQ {
  private data: [number, number, number][] = [];
  push(val: [number, number, number]) {
    this.data.push(val);
    this.siftUp(this.data.length - 1);
  }
  pop(): [number, number, number] | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.siftDown(0);
    }
    return top;
  }
  empty(): boolean { return this.data.length === 0; }
  private siftUp(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p][0] <= this.data[i][0]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  private siftDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l][0] < this.data[smallest][0]) smallest = l;
      if (r < n && this.data[r][0] < this.data[smallest][0]) smallest = r;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

function main() {
  const input = fs.readFileSync(0, 'utf8').trim().split(/\r?\n/);
  const [H, W] = input[0].split(' ').map(Number);
  const grid: string[] = input.slice(1, H + 1).map(l => l.trim());

  let sr = 0, sc = 0;
  for (let i = 0; i < H; i++) {
    const row = grid[i];
    for (let j = 0; j < W; j++) {
