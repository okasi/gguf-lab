import * as fs from "fs";

const input = fs.readFileSync(0, "utf8").trim().split(/\s+/);
const ptr = { i: 0 };

const next = (): number => {
  return parseInt(input[ptr.i++], 10);
};

const N = next();
const Q = next();

const L: number[] = new Array(N);
const R: number[] = new Array(N);

for (let i = 0; i < N; i++) {
  L[i] = next();
  R[i] = next();
}

L.sort((a, b) => a - b);
R.sort((a, b) => a - b);

const upperBound = (arr: number[], x: number): number => {
  let left = 0, right = arr.length;
  while (left < right) {
    const mid = (left + right) >> 1;
    if (arr[mid] <= x) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
};

const lowerBound = (arr: number[], x: number): number => {
  let left = 0, right = arr.length;
  while (left < right) {
    const mid = (left + right) >> 1;
    if (arr[mid] < x) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
};

const answers: string[] = [];
for (let i = 0; i < Q; i++) {
  const x = next();
  const countL = upperBound(L, x);
  const countR = lowerBound(R, x);
  answers.push(String(countL - countR));
}

console.log(answers.join(" "));
