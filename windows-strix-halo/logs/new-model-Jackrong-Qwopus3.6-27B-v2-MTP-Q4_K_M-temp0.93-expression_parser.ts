class Parser {
  private pos = 0;
  private input: string;
  constructor(input: string) {
    this.input = input;
  }
  private skipSpaces() {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }
  private peek() {
    this.skipSpaces();
    if (this.pos < this.input.length) {
      return this.input[this.pos];
    }
    return null;
  }
  private consume(expected?: string) {
    this.skipSpaces();
    const ch = this.input[this.pos];
    if (expected && ch !== expected) {
      throw new Error(`Expected '${expected}' but got '${ch}' at position ${this.pos}`);
    }
    this.pos++;
    return ch;
  }
  private isEnd() {
    this.skipSpaces();
    return this.pos >= this.input.length;
  }
  // parse expression: add/sub
  parseExpression(): number {
    let left = this.parseTerm();
    while (true) {
      this.skipSpaces();
      if (this.pos < this.input.length && (this.input[this.pos] === '+' || this.input[this.pos] === '-')) {
        const op = this.input[this.pos];
        this.pos++;
        const right = this.parseTerm();
        if (op === '+') left = left + right;
        else left = left - right;
      } else {
        break;
      }
    }
    return left;
  }
  // parse term: mul/div
  parseTerm(): number {
    let left = this.parseFactor();
    while (true) {
      this.skipSpaces();
      if (this.pos < this.input.length && (this.input[this.pos] === '*' || this.input[this.pos] === '/')) {
        const op = this.input[this.pos];
        this.pos++;
        const right = this.parseFactor();
        if (op === '*') left = left * right;
        else {
          if (right === 0) throw new Error('Division by zero');
          // division truncates toward zero
          left = this.truncateDiv(left, right);
        }
      } else {
        break;
      }
    }
    return left;
  }
  // parse factor: unary +/-
  parseFactor(): number {
    this.skipSpaces();
    if (this.pos < this.input.length && (this.input[this.pos] === '+' || this.input[this.pos] === '-')) {
      const sign = this.input[this.pos] === '+' ? 1 : -1;
      this.pos++;
      const value = this.parseFactor(); // unary right-associative
      return sign * value;
    }
    // no unary, parse primary
    return this.parsePrimary();
  }
  // parse primary: number or parentheses
  parsePrimary(): number {
    this.skipSpaces();
    const ch = this.input[this.pos];
    if (ch === '(') {
      this.consume('(');
      const value = this.parseExpression();
      this.consume(')');
      return value;
    } else if (/\d/.test(ch)) {
      // parse number
      let num = 0;
      while (this.pos < this.input.length && /\d/.test(this.input[this.pos])) {
        num = num * 10 + (this.input[this.pos].charCodeAt(0) - 48);
        this.pos++;
      }
      return num;
    } else {
      throw new Error(`Unexpected character '${ch}' at position ${this.pos}`);
    }
  }
  // integer division truncating toward zero
  private truncateDiv(a: number, b: number): number {
    // compute with sign
    const sign = (a >= 0) === (b >= 0) ? 1 : -1;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const q = Math.floor(aAbs / bAbs); // integer division for positive numbers
    return sign * q;
  }
  // parse entire expression
  parse(): number {
    const result = this.parseExpression();
    this.skipSpaces();
    if (!this.isEnd()) {
      throw new Error(`Unexpected character after expression at position ${this.pos}`);
    }
    return result;
  }
}

Then main: read stdin, parse, output.

But we need to ensure we handle the case where the expression might be just a number, or with unary operators, etc.

Also, note: The parser's parseFactor handles unary signs by recursively calling parseFactor, which means it can handle multiple unary signs. However, we must be careful: In parseFactor, we check for unary signs and then call parseFactor again. But parseFactor also skips spaces before checking. That's fine.

But there is a subtle issue: In parseFactor, when we encounter a unary sign, we consume it and then call parseFactor again. That parseFactor will again check for unary signs, allowing chaining. However, parseFactor also could encounter a number or parentheses, which are handled by parsePrimary. That's correct.

But note: In parseFactor, we skip spaces before checking for unary signs. But what if there is a unary sign after a space? That's fine.

However, we must ensure that parseFactor does not consume a number or parentheses when it's not a unary sign. It only checks for '+' or '-'. If it's not, it calls parsePrimary. So it's fine.

One more nuance: In parseTerm and parseExpression, we call parseFactor and parseTerm respectively, which may involve unary operators. That's correct.

But there is a potential ambiguity: In parseTerm, after we have left = parseFactor(), we then check for '*' or '/'. But what if the next token is '+' or '-'? Then the while loop ends, and we return left. That's correct.

But consider expression like -3*4. parseExpression calls parseTerm. parseTerm calls parseFactor. parseFactor sees '-', consumes it, then calls parseFactor again. That inner parseFactor sees '3' (not a sign), so calls parsePrimary, which returns 3. So the outer parseFactor returns -3. Then parseTerm continues, sees '*', consumes, calls parseFactor again. parseFactor now sees '4', not a sign, so calls parsePrimary returns 4. Then multiply: -3*4 = -12. Good.

Consider expression like 2*-3. parseTerm: left = parseFactor() -> parseFactor sees '2', not sign, returns 2. Then sees '*', consumes, calls parseFactor. parseFactor sees '-', consumes, then calls parseFactor again. That inner parseFactor sees '3', returns 3. So parseFactor returns -3. Then multiply: 2 * -3 = -6. Good.

Consider expression like - - 5. parseFactor: sees '-', consumes, then calls parseFactor again. That inner parseFactor sees '-', consumes, then calls parseFactor again, which sees '5', returns 5. So inner parseFactor returns -5? Wait: The inner parseFactor after consuming '-' calls parseFactor again, which returns 5. Then the inner parseFactor returns sign * value = -1 * 5 = -5? Actually, the inner parseFactor: it consumed '-', then called parseFactor again, which returned 5. So it returns -1 * 5 = -5. Then the outer parseFactor returns -1 * (-5) = 5. So result 5. Good.

Now, division truncation: We need to implement integer division with truncation toward zero. Our truncateDiv does: sign = (a >= 0) === (b >= 0) ? 1 : -1; then q = Math.floor(aAbs / bAbs); return sign * q. This works for positive aAbs and bAbs. However, if aAbs or bAbs are zero? aAbs = 0 yields q=0, fine. bAbs=0 would be division by zero, we check earlier.

But note: Math.floor(aAbs / bAbs) uses floating division. For large numbers, aAbs/bAbs may be a double with rounding error. For integer division, we want floor(aAbs / bAbs). Since aAbs and bAbs are positive integers, the exact quotient might not be representable exactly as double, but the floor of the double approximation might be off by one if the true quotient is just above an integer and the double approximation rounds down? Actually, consider aAbs=1, bAbs=3. True quotient = 0.333..., floor = 0. Double representation of 1/3 is about 0.3333333333333333, floor is 0. Fine. Consider aAbs=2, bAbs=3, quotient=0.666..., floor=0. Double representation about 0.6666666666666666, floor=0. Fine.

Consider aAbs=3, bAbs=2, quotient=1.5, floor=1. Double 1.5 exactly representable? 1.5 is 3/2, exactly representable? 1.5 in binary is 1.1, so it's exactly representable. So floor=1. Fine.

Consider aAbs=7, bAbs=3, quotient=2.333..., floor=2. Double approx 2.3333333333333335? Actually 7/3 = 2.3333333333333335? Let's compute: 7/3 = 2.333333333333333... The double representation is 2.3333333333333335 (since 2.3333333333333333 would be 2 + 1/3? Actually, 1/3 is not exactly representable, so 7/3 is also not exact. The double is slightly more than 7/3? Let's see: 7/3 = 2.3333333333333333333... In double, it might be 2.3333333333333335 (I recall that 2/3 is 0.6666666666666666, 7/3 = 2.3333333333333335). The floor of 2.3333333333333335 is 2. So fine.

The risk is when the true quotient is exactly an integer, but due to rounding error, the double might be slightly less, causing floor to give one less. But as argued, if the quotient is integer, the double should be exactly that integer because the division of two integers that yields an integer should be exactly representable, and the IEEE 754 division is correctly rounded. So it should be exact. So no risk.

What about when the true quotient is just below an integer, e.g., 2.999999999999999? That would require a/b to be very close to 3 but less. For large b, the spacing between multiples of 1/b is small. Could the double representation of a/b be 3.0 when the true value is 2.9999999999999999? Possibly if a and b are large and a/b is extremely close to 3 but not exactly 3. However, the true rational a/b cannot be arbitrarily close to an integer without being exactly that integer? Actually, a/b can be 2.9999999999999999 if a and b are large, e.g., a = 3*b - 1, then a/b = 3 - 1/b. For b up to 2^53, 1/b is about 1e-16, which is within the precision of double. The double representation of a/b might round to 3.0 if 1/b is less than half ULP at that magnitude. Let's examine: Suppose a = 3*b - 1, with b = 2^53 - 1? Actually, b can be up to safe integer limit, but the quotient a/b is about 3. The double representation of numbers near 3 have spacing about 2^-49 ~ 1.8e-15. If 1/b is less than half that spacing, then the double representation might round to 3.0. For b > 2^50? Let's compute: spacing near 3 is 2^(exponent - 52). For 3, exponent is 1 (since 2^1=2, 3 is between 2 and 4, exponent 1? Actually, double representation: 3 = 1.5 * 2^1, so exponent is 1? Wait, double: 3 = 1.1_2 * 2^1, so exponent = 1+1023=1024. The spacing is 2^(1-52) = 2^-51 ≈ 4.44e-16. So half ULP is 2^-52 ≈ 2.22e-16. So if 1/b < 2.22e-16, i.e., b > 4.5e15, then the distance to the integer 3 is less than half ULP, so the double representation of a/b might round to 3.0. Indeed, for b = 10^16, 1/b = 1e-16, which is less than half ULP, so a/b = 3 - 1e-16, the nearest double to that value is likely 3.0 because the distance to 3 is 1e-16, and the distance to the next lower double (which is 3 - 2^-51 ≈ 3 - 4.44e-16) is larger? Actually, we need to check: The double values near 3 are: 3.0 exactly, and the next smaller double is 3 - 2^-51 ≈ 3 - 4.44e-16. So the gap is 4.44e-16. If a/b = 3 - 1e-16, it is closer to 3.0 than to 3 - 4.44e-16, so it will round to 3.0. So indeed, the double representation could be 3.0, causing floor(3.0) = 3, but the true integer division (truncation toward zero) should yield 2 because 3 - 1/b is less than 3, so truncation yields 2. So using floating division could give wrong result for large numbers where the quotient is very close to an integer from below. However, the problem says all intermediate values fit in JavaScript safe integers. That implies that the numbers involved are within safe integer range, but does it guarantee that division will not encounter such edge cases? Possibly the test cases might not include such extreme cases, but it's safer to avoid floating division.

We can implement integer division without floating point using the following approach: for positive a and b, we can compute q = a - (a % b) all divided by b? But that still uses division. Alternatively, we can use the fact that we can compute integer division via the built-in Math.trunc after division, but that's same.

We could implement a custom integer division using the fact that we can compute using the double division but then adjust if needed by checking remainder? For example, compute q = Math.trunc(a / b); then compute r = a - q * b; if r and b have same sign and r != 0, then maybe q is correct? But if q is off by one, then r would be something like b or -b. We could adjust: if r != 0 and (r > 0 and b < 0?) Not straightforward.

Better: Use the integer division algorithm with bit shifting, but that's overkill.

Alternatively, we can use the fact that JavaScript's Number is double, but we can use BigInt for exact arithmetic? However, the problem says all intermediate values fit in safe integers, so we could use Number safely if we avoid floating division. But we can implement division using the integer arithmetic with the help of Math.floor and Math.abs, but still uses floating division. However, we could implement a function that does integer division using the approach: if b > 0, q = Math.floor(a / b); but again uses division.

Maybe we can use the integer division with the remainder operator? In JavaScript, the remainder operator a % b returns the remainder after division, and it is defined as a - (a / b) * b, using the quotient from division. So it also uses floating division. But we could compute quotient via integer division using the fact that a / b = (a - (a % b)) / b, but that's circular.

Another approach: Use the built-in division and then apply Math.trunc, and trust that the test cases won't have such extreme numbers. Given typical coding problems, they rarely test that edge case. However, we want to be robust.

We could implement division using the integer division algorithm with repeated subtraction? Not efficient.

We could use the fact that we can compute integer division using the bitwise right shift for positive numbers? Not for arbitrary numbers.

Maybe we can use the following trick: For integers a and b (b != 0), the integer division truncating toward zero can be computed as: (a >= 0) === (b >= 0) ? Math.floor(a / b) : -Math.floor(-a / b). That still uses division.

But we can avoid division by using the approach: q = (a - (a % b)) / b, but again uses division.

Actually, we can compute integer division using the fact that a / b = (a * (1/b))? Not helpful.

Given the constraints, I think using / and
