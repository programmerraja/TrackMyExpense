import {
  formatDay,
  fromInputDate,
  matchingPreset,
  presetRange,
  toInputDate,
} from "./dateRange";

describe("range picker round trip", () => {
  test("a picked day comes back as the same day", () => {
    expect(toInputDate(fromInputDate("2026-09-01"))).toBe("2026-09-01");
    expect(toInputDate(fromInputDate("2026-01-01"))).toBe("2026-01-01");
  });

  test("the first of the month reads as the first, not the day before", () => {
    // Local midnight is the previous day in UTC east of GMT, which is what a
    // plain ISO slice used to show in the picker.
    const firstOfMonth = new Date(2026, 8, 1);

    expect(toInputDate(firstOfMonth)).toBe("2026-09-01");
    expect(formatDay(firstOfMonth)).toContain("Sep");
  });
});

describe("preset highlighting", () => {
  test("a preset matches the range it just produced", () => {
    const range = presetRange("thisMonth");

    expect(
      matchingPreset({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      }),
    ).toBe("thisMonth");
  });

  test("a hand-picked range equal to a preset still lights it up", () => {
    const now = new Date();
    const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    expect(
      matchingPreset({
        start: fromInputDate(firstOfMonth),
        end: fromInputDate(toInputDate(now)),
      }),
    ).toBe("thisMonth");
  });

  test("an unrelated range highlights nothing", () => {
    expect(
      matchingPreset({
        start: fromInputDate("2019-03-07"),
        end: fromInputDate("2019-04-02"),
      }),
    ).toBeUndefined();
  });

  test("an unknown preset has no range", () => {
    expect(presetRange("nope")).toBeNull();
  });
});
