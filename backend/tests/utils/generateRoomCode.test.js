/**
 * @fileoverview Unit tests for the generateRoomCode utility.
 */

const { generateRoomCode } = require("../../utils/generateRoomCode");

describe("generateRoomCode utility", () => {
  test("should return a string", () => {
    const code = generateRoomCode();
    expect(typeof code).toBe("string");
  });

  test("should return a 4-character code", () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(4);
  });

  test("should return an uppercase string", () => {
    const code = generateRoomCode();
    expect(code).toBe(code.toUpperCase());
  });

  test("should only contain alphanumeric characters", () => {
    const code = generateRoomCode();
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });

  test("should generate different codes on successive calls (statistical)", () => {
    const codes = new Set();
    for (let i = 0; i < 50; i++) {
      codes.add(generateRoomCode());
    }
    // With 50 random codes, we should have at least 2 unique ones
    expect(codes.size).toBeGreaterThan(1);
  });
});
