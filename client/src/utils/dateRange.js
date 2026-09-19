// A range is stored as an ISO instant but picked and read as a local day. Both
// directions go through local time on purpose: slicing the ISO string instead
// reads a day early everywhere east of GMT, so the picker would disagree with
// the range printed beside it.
export const toInputDate = (value) => new Date(value).toLocaleDateString("en-CA");

export const fromInputDate = (value) =>
  new Date(`${value}T00:00:00`).toISOString();

export const formatDay = (value, withYear) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });

export const PRESETS = [
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "last3", label: "3 months" },
  { id: "thisYear", label: "This year" },
];

export const presetRange = (preset, now = new Date()) => {
  switch (preset) {
    case "thisMonth":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
    case "lastMonth":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0),
      };
    case "last3":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        end: now,
      };
    case "thisYear":
      return { start: new Date(now.getFullYear(), 0, 1), end: now };
    default:
      return null;
  }
};

// Which shortcut, if any, produced the range currently on screen. Compared as
// local days so a hand-picked range that happens to match still lights it up.
export const matchingPreset = (range) =>
  PRESETS.find((preset) => {
    const bounds = presetRange(preset.id);
    return (
      toInputDate(bounds.start) === toInputDate(range.start) &&
      toInputDate(bounds.end) === toInputDate(range.end)
    );
  })?.id;
