export function addMinutesToDate(date: Date, minutes: number) {
  const d = new Date(date);
  d.setTime(d.getTime() + minutes * 60_000);
  return d;
}
export const dateTime = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
});
