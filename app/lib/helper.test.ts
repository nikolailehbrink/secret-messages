import { describe, it, expect } from "vitest";
import { dateTime } from "./helper";

describe("dateTime", () => {
  it("should format date and time correctly", () => {
    const date = new Date("2023-10-01T14:48:00.000Z");
    const formattedDate = dateTime.format(date);
    // Adjust the expected output to match your local timezone
    expect(formattedDate).toBe("Sunday, October 1, 2023 at 4:48 PM"); // Example for EDT (UTC-4)
  });

  it("should handle invalid date input gracefully", () => {
    const invalidDate = new Date("invalid-date");
    expect(() => dateTime.format(invalidDate)).toThrow(RangeError);
  });
});
