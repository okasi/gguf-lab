import sys
from bisect import bisect_right, bisect_left

def main():
    data = sys.stdin.buffer.read().split()
    if not data:
        return
    it = iter(data)
    N = int(next(it))
    Q = int(next(it))
    lefts = []
    rights = []
    for _ in range(N):
        l = int(next(it))
        r = int(next(it))
        lefts.append(l)
        rights.append(r)
    lefts.sort()
    rights.sort()
    results = []
    for _ in range(Q):
        x = int(next(it))
        ans = bisect_right(lefts, x) - bisect_left(rights, x)
        results.append(str(ans))
    sys.stdout.write(' '.join(results))

if __name__ == '__main__':
    main()
