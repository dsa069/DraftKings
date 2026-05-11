export class Calculator {
  add(a: number, b: number): number {
    console.log("Debug message");

    return a + b;
  }

  multiply(a: number, b: number): number {
    return a * b;
  }

  divide(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  }
}

export default Calculator;
