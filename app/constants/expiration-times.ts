export const EXPIRATION_TIMES = new Map([
  ["1", "1 Min."],
  ["15", "15 Min."],
  ["60", "1 Hour"],
  ["720", "12 Hours"],
  ["4320", "3 Days"],
  ["10080", "7 Days"],
  ["40320", "28 days"],
  ["262800", "6 Months"],
  ["525600", "1 Year"],
] as const);

export const EXPIRATION_TIMES_VALUES = EXPIRATION_TIMES.keys();
