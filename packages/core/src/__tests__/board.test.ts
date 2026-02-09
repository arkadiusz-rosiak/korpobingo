import { describe, expect, it } from "vitest";
import { Board } from "../board.js";

describe("Board.shuffle", () => {
  it("returns array of same length", () => {
    const input = [1, 2, 3, 4, 5];
    const result = Board.shuffle(input);
    expect(result).toHaveLength(5);
  });

  it("contains all original elements", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = Board.shuffle(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it("does not modify original array", () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    Board.shuffle(input);
    expect(input).toEqual(original);
  });

  it("produces different orderings (statistical)", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(Board.shuffle(input).join(","));
    }
    // With 10 elements, getting the same order twice in 20 tries is astronomically unlikely
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("Board.generate", () => {
  it("generates board of correct size for 3x3", () => {
    const words = Array.from({ length: 9 }, (_, i) => `word${i}`);
    const cells = Board.generate(words, 3);
    expect(cells).toHaveLength(9);
  });

  it("generates board of correct size for 4x4", () => {
    const words = Array.from({ length: 20 }, (_, i) => `word${i}`);
    const cells = Board.generate(words, 4);
    expect(cells).toHaveLength(16);
  });

  it("throws if not enough words", () => {
    const words = ["a", "b", "c"];
    expect(() => Board.generate(words, 3)).toThrow("Need at least 9 words");
  });

  it("uses only provided words", () => {
    const words = Array.from({ length: 16 }, (_, i) => `word${i}`);
    const cells = Board.generate(words, 4);
    for (const cell of cells) {
      expect(words).toContain(cell);
    }
  });
});

describe("Board.checkBingo", () => {
  // 3x3 grid indices:
  // 0 1 2
  // 3 4 5
  // 6 7 8

  it("detects row bingo", () => {
    const marked = [true, true, true, false, false, false, false, false, false];
    const result = Board.checkBingo(marked, 3);
    expect(result.hasBingo).toBe(true);
    expect(result.lines).toContainEqual({ type: "row", index: 0 });
  });

  it("detects middle row bingo", () => {
    const marked = [false, false, false, true, true, true, false, false, false];
    const result = Board.checkBingo(marked, 3);
    expect(result.hasBingo).toBe(true);
    expect(result.lines).toContainEqual({ type: "row", index: 1 });
  });

  it("detects column bingo", () => {
    const marked = [true, false, false, true, false, false, true, false, false];
    const result = Board.checkBingo(marked, 3);
    expect(result.hasBingo).toBe(true);
    expect(result.lines).toContainEqual({ type: "col", index: 0 });
  });

  it("detects main diagonal bingo", () => {
    const marked = [true, false, false, false, true, false, false, false, true];
    const result = Board.checkBingo(marked, 3);
    expect(result.hasBingo).toBe(true);
    expect(result.lines).toContainEqual({ type: "diagonal", index: 0 });
  });

  it("detects anti-diagonal bingo", () => {
    const marked = [false, false, true, false, true, false, true, false, false];
    const result = Board.checkBingo(marked, 3);
    expect(result.hasBingo).toBe(true);
    expect(result.lines).toContainEqual({ type: "diagonal", index: 1 });
  });

  it("detects diagonal bingo from scattered marks", () => {
    const marked = [true, true, false, false, true, false, false, false, true];
    const result = Board.checkBingo(marked, 3);
    // Main diagonal IS complete here (0,4,8)
    expect(result.hasBingo).toBe(true);
  });

  it("returns no bingo for empty board", () => {
    const marked = new Array(9).fill(false);
    const result = Board.checkBingo(marked, 3);
    expect(result.hasBingo).toBe(false);
    expect(result.lines).toHaveLength(0);
  });

  it("detects multiple bingo lines", () => {
    const marked = [true, true, true, true, true, true, true, true, true];
    const result = Board.checkBingo(marked, 3);
    expect(result.hasBingo).toBe(true);
    // 3 rows + 3 cols + 2 diags = 8
    expect(result.lines).toHaveLength(8);
  });

  it("works with 4x4 board", () => {
    // 4x4 grid: row 0 complete
    const marked = [
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
    const result = Board.checkBingo(marked, 4);
    expect(result.hasBingo).toBe(true);
    expect(result.lines).toContainEqual({ type: "row", index: 0 });
  });

  it("detects 4x4 diagonal", () => {
    const marked = [
      true,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      true,
    ];
    const result = Board.checkBingo(marked, 4);
    expect(result.hasBingo).toBe(true);
    expect(result.lines).toContainEqual({ type: "diagonal", index: 0 });
  });

  it("no false positive with almost-complete row", () => {
    const marked = [
      true,
      true,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
    const result = Board.checkBingo(marked, 4);
    expect(result.hasBingo).toBe(false);
  });
});
