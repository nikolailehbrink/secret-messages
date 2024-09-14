export const EXPIRATION_TIMES = [
  ["1", "1 Min."],
  ["15", "15 Min."],
  ["60", "1 Hour"],
  ["720", "12 Hours"],
  ["4320", "3 Days"],
  ["10080", "7 Days"],
  ["40320", "28 days"],
] as const;

export const EXPIRATION_TIMES_VALUES = EXPIRATION_TIMES.map(([value]) => value);
