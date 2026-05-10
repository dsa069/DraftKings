import { Calculator } from "../src/utils/Calculator";

describe("Calculator simple tests", () => {
  const calc = new Calculator();

  test("add should return correct sum", () => {
    expect(calc.add(2, 3)).toBe(5);
  });

  test("multiply should return correct product", () => {
    expect(calc.multiply(4, 5)).toBe(20);
  });

  test("divide should throw on division by zero", () => {
    expect(() => calc.divide(1, 0)).toThrow("Division by zero");
  });
});
