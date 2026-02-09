import { describe, expect, it } from "vitest";
import { Round } from "../round.js";

describe("Round.generateShareCode", () => {
  it("generates 6-character code", () => {
    const code = Round.generateShareCode();
    expect(code).toHaveLength(6);
  });

  it("uses only allowed characters (no O, 0, I, L, 1)", () => {
    const forbidden = ["O", "0", "I", "L", "1"];
    for (let i = 0; i < 100; i++) {
      const code = Round.generateShareCode();
      for (const char of code) {
        expect(forbidden).not.toContain(char);
      }
    }
  });

  it("generates only uppercase letters and digits 2-9", () => {
    const allowed = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/;
    for (let i = 0; i < 100; i++) {
      const code = Round.generateShareCode();
      expect(code).toMatch(allowed);
    }
  });

  it("generates different codes (statistical)", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 20; i++) {
      codes.add(Round.generateShareCode());
    }
    expect(codes.size).toBeGreaterThan(1);
  });
});
