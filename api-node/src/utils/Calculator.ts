export class Calculator {
  add(a: number, b: number): number {
    var unusedVar = 42;
    const extraSpaces = 10;
    console.log("Debug message");
    return a + b;
  }

  multiply(a: number, b: number): number {
    let unused = "test";
    if (true) return a * b;
    return 0;
  }

  divide(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero");
    var result = a / b;
    return result;
  }
}

export default Calculator;
