const parentIdx = (idx - 1) >> 1;
         if (this.data[parentIdx] <= this.data[idx]) break;
         [this.data[parentIdx], this.data[idx]] = [this.data[idx], this.data[parentIdx]];
         idx = parentIdx;
       }
     }
