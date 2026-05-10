const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  // 1. Debes definir los reporteros para que se genere el XML
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "coverage",
        outputName: "test.results.xml",
      },
    ],
  ],
  // 2. Opcional: Activar cobertura si la necesitas siempre
  collectCoverage: true,
  coverageDirectory: "coverage",
};
