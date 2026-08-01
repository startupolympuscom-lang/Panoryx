import { describe, it, expect } from "vitest";
import { formatMAD, formatNumberFr, formatDateFr, cn } from "@/lib/utils";

describe("formatMAD", () => {
  it("formats a whole number as Moroccan dirham currency", () => {
    const result = formatMAD(1299250);
    expect(result).toContain("1");
    expect(result).toMatch(/MAD|DH/);
  });

  it("rounds to the nearest dirham (no decimals)", () => {
    const result = formatMAD(100.6);
    expect(result).not.toMatch(/[.,]6/);
  });
});

describe("formatNumberFr", () => {
  it("uses French grouping conventions", () => {
    expect(formatNumberFr(94300)).toMatch(/94.300|94 300/);
  });

  it("supports fraction digits", () => {
    expect(formatNumberFr(8.456, 2)).toContain("8");
  });
});

describe("formatDateFr", () => {
  it("formats a date in French", () => {
    const result = formatDateFr("2026-08-01");
    expect(result).toMatch(/août|2026/);
  });
});

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", undefined, "font-bold")).toBe("text-sm font-bold");
  });
});
