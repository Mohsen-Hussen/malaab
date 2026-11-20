import {
  buildSlots,
  canCancelForFree,
  formatSAR,
  formatTime,
  nextDays,
  overlaps,
  priceFor,
  takenRanges,
  toDateKey,
} from "@/features/booking/slots";
import { getVenue, type Venue } from "@/features/venues/data";

const venue = getVenue("padel-hub-olaya") as Venue; // 08:00–24:00, SAR 240/hour
const tomorrow = toDateKey(new Date(Date.now() + 86_400_000));

describe("time helpers", () => {
  it("formats minutes as HH:MM", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(18 * 60 + 30)).toBe("18:30");
    expect(formatTime(24 * 60)).toBe("00:00");
  });

  it("lists the next N days starting today", () => {
    const days = nextDays(7, new Date(2026, 11, 29));
    expect(days).toEqual([
      "2026-12-29",
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
      "2027-01-03",
      "2027-01-04",
    ]);
  });

  it("detects overlapping ranges but not touching ones", () => {
    expect(overlaps({ start: 60, end: 120 }, { start: 90, end: 150 })).toBe(true);
    expect(overlaps({ start: 60, end: 120 }, { start: 120, end: 180 })).toBe(false);
  });
});

describe("buildSlots", () => {
  it("never runs past closing time", () => {
    const slots = buildSlots(venue, tomorrow, 120);
    const last = slots[slots.length - 1];
    expect(last.start + 120).toBeLessThanOrEqual(venue.close * 60);
    expect(slots[0].start).toBe(venue.open * 60);
  });

  it("marks slots that overlap taken ranges as unavailable", () => {
    const taken = takenRanges(venue, tomorrow);
    const slots = buildSlots(venue, tomorrow, 60);
    for (const slot of slots) {
      const clash = taken.some((t) => overlaps({ start: slot.start, end: slot.start + 60 }, t));
      expect(slot.available).toBe(!clash);
    }
  });

  it("blocks the user's own bookings too", () => {
    const free = buildSlots(venue, tomorrow, 60).find((slot) => slot.available)!;
    const slots = buildSlots(venue, tomorrow, 60, [{ start: free.start, end: free.start + 60 }]);
    expect(slots.find((slot) => slot.start === free.start)?.available).toBe(false);
  });

  it("hides start times that have already passed today", () => {
    const now = new Date();
    now.setHours(12, 10, 0, 0);
    const slots = buildSlots(venue, toDateKey(now), 60, [], now);
    expect(
      slots.filter((slot) => slot.start <= 12 * 60 + 10).every((slot) => !slot.available),
    ).toBe(true);
  });

  it("is deterministic for the same venue and day", () => {
    expect(takenRanges(venue, "2026-12-01")).toEqual(takenRanges(venue, "2026-12-01"));
  });
});

describe("priceFor", () => {
  it("charges off-peak time at the hourly rate plus 15% VAT", () => {
    expect(priceFor(venue, 10 * 60, 60)).toEqual({
      base: 240_00,
      peakSurcharge: 0,
      vat: 36_00,
      total: 276_00,
    });
  });

  it("adds 25% only to the minutes from 18:00", () => {
    // 17:30–19:00: 60 of the 90 minutes are peak.
    const price = priceFor(venue, 17 * 60 + 30, 90);
    expect(price.base).toBe(360_00);
    expect(price.peakSurcharge).toBe(60_00);
    expect(price.vat).toBe(63_00);
    expect(price.total).toBe(483_00);
  });
});

describe("cancellation & formatting", () => {
  it("allows free cancellation only 24h or more before the start", () => {
    const now = new Date(2026, 10, 20, 10, 0);
    expect(canCancelForFree("2026-11-21", 10 * 60, now)).toBe(true);
    expect(canCancelForFree("2026-11-21", 9 * 60 + 59, now)).toBe(false);
  });

  it("formats SAR in both languages", () => {
    expect(formatSAR(276_00, "en")).toBe("SAR 276.00");
    expect(formatSAR(276_00, "ar")).toBe("276.00 ر.س");
  });
});
