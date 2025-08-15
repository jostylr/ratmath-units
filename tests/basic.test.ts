import { describe, expect, it } from "bun:test";
import { Unit, parseUnitString } from "../src";

describe("unit string parser", () => {
  it("parses products and quotients", () => {
    expect(parseUnitString("m^2/s")).toEqual({ m: 2, s: -1 });
    expect(parseUnitString("kg*m/s^2")).toEqual({ kg: 1, m: 1, s: -2 });
  });
});

describe("scientific unit arithmetic", () => {
  it("adds compatible units", () => {
    const a = Unit.sci(2, "m");
    const b = Unit.sci(3, "m");
    const c = a.add(b);
    expect(String(c)).toBe("5 m");
  });

  it("throws on incompatible add/sub", () => {
    const a = Unit.sci(2, "m");
    const b = Unit.sci(3, "s");
    expect(() => a.add(b)).toThrow();
  });

  it("multiplies and divides units", () => {
    const a = Unit.sci(2, "m");
    const b = Unit.sci(3, "s");
    const prod = a.mul(b);
    expect(String(prod)).toBe("6 m*s");
    const div = a.div(b);
    expect(String(div)).toBe("0.6666666666666666 m*s^-1");
  });

  it("integer powers adjust exponents", () => {
    const v = Unit.sci(2, "m/s");
    const sq = v.pow(2);
    expect(String(sq)).toBe("4 m^2*s^-2");
  });
});

