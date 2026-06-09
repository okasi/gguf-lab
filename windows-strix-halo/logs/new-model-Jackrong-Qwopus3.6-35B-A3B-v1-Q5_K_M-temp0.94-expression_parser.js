"use strict";
let top = stack[stack.length - 1];
if (top === '(')
    break;
// Check if top is an operator (unary or binary) and has greater or equal precedence (for left-associative) or greater precedence (for right-associative)
if (top.type === 'unary' || top.type === 'operator') {
    let precTop = getPrecedence(top);
    let precCur = getPrecedence(currentToken);
    let assocTop = getAssociativity(top);
    // Actually, we don't need to store associativity for unary operators? Because we know unary operators are always right-associative.
    // But for binary operators, we have associativity stored? Actually, we can store it in the token.
    // Alternatively, we can compute:
    // For the current token, if it is binary, then associativity is left? But wait, we are processing the current token, and we are going to push it. The rule for popping the top: 
    //   if the top operator has greater precedence, or same precedence and left-associative, then we pop.
    //   for right-associative, we only pop if the top has greater precedence.
    // But note: the current token might be unary? Then we are going to push it. The rule: we pop the top if the top has greater precedence? Actually, the current token is unary and has high precedence, so we don't pop any operator? But wait, the top might be a unary operator? Then we have:
    //   precedence(top) = 4, precedence(current) = 4 -> same precedence, and associativity of current token is right, so we don't pop? Actually, the rule for right-associative: we only pop if the top has strictly greater precedence. So if the top has the same precedence and the current is right-associative, we don't pop.
    // So the condition for popping the top:
    //   if (precTop > precCur) -> pop (because regardless of associativity, if the top has greater precedence, we pop)
    //   else if (precTop == precCur && associativity of current token is left) -> pop? 
    //        But wait: the current token might be right-associative, then we don't pop? Actually, the rule for right-associative operators: we don't pop when the precedence is the same.
    //   However, the standard rule for left-associative: we pop when the precedence is the same or greater? Actually, no: the rule for left-associative: we pop while the operator on the stack has greater or equal precedence. For right-associative: we pop while the operator on the stack has greater precedence.
    //   But note: the current token's associativity is not used for the popping condition? Actually, the popping condition depends on the current token's associativity? 
    //   Actually, the rule is: 
    //      while there is an operator at the top of the stack, and 
    //        - the operator has greater precedence than the current operator, OR
    //        - the operator has equal precedence and the current operator is left
} // but note: for binary operators, we have associativity, for unary operators, we have right-associativity.
// Actually, we don't need to store associativity for unary operators? Because we know unary operators are always right-associative.
// But for binary operators, we have associativity stored? Actually, we can store it in the token.
// Alternatively, we can compute:
// For the current token, if it is binary, then associativity is left? But wait, we are processing the current token, and we are going to push it. The rule for popping the top: 
//   if the top operator has greater precedence, or same precedence and left-associative, then we pop.
//   for right-associative, we only pop if the top has greater precedence.
// But note: the current token might be unary? Then we are going to push it. The rule: we pop the top if the top has greater precedence? Actually, the current token is unary and has high precedence, so we don't pop any operator? But wait, the top might be a unary operator? Then we have:
//   precedence(top) = 4, precedence(current) = 4 -> same precedence, and associativity of current token is right, so we don't pop? Actually, the rule for right-associative: we only pop if the top has strictly greater precedence. So if the top has the same precedence and the current is right-associative, we don't pop.
// So the condition for popping the top:
//   if (precTop > precCur) -> pop (because regardless of associativity, if the top has greater precedence, we pop)
//   else if (precTop == precCur && associativity of current token is left) -> pop? 
//        But wait: the current token might be right-associative, then we don't pop? Actually, the rule for right-associative operators: we don't pop when the precedence is the same.
//   However, the standard rule for left-associative: we pop when the precedence is the same or greater? Actually, no: the rule for left-associative: we pop while the operator on the stack has greater or equal precedence. For right-associative: we pop while the operator on the stack has greater precedence.
//   But note: the current token's associativity is not used for the popping condition? Actually, the popping condition depends on the current token's associativity? 
//   Actually, the rule is: 
//      while there is an operator at the top of the stack, and 
//        - the operator has greater precedence than the current operator, OR
//        - the operator has equal precedence and the current operator is left
