module.exports = {
  testEnvironment: "jsdom",

  testMatch: ["<rootDir>/src/tests/**/*.test.[jt]s?(x)"],

  setupFiles: ["<rootDir>/src/setupTests.js"],

  moduleNameMapper: {
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/src/tests/fileMock.js",
  },

  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/tests/**",
    "!src/main.jsx"
  ],

  coverageReporters: ["text", "lcov"],
};