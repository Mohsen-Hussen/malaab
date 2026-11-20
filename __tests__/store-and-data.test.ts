import { myTakenRanges, splitByTime, useBookings, type Booking } from "@/features/booking/store";
import { filterVenues, venues } from "@/features/venues/data";
import { strings } from "@/i18n/strings";

const price = { base: 100_00, peakSurcharge: 0, vat: 15_00, total: 115_00 };

beforeEach(() => useBookings.getState().reset());

describe("filterVenues", () => {
  it("searches Arabic and English names", () => {
    expect(filterVenues(venues, { query: "padel" }).map((v) => v.id)).toEqual([
      "padel-hub-olaya",
      "corniche-padel",
    ]);
    expect(filterVenues(venues, { query: "النخيل" }).map((v) => v.id)).toEqual([
      "al-nakheel-arena",
    ]);
  });

  it("combines sport and city filters", () => {
    const result = filterVenues(venues, { sport: "football", city: "jeddah" });
    expect(result.map((v) => v.id)).toEqual(["jeddah-five-a-side"]);
  });
});

describe("booking store", () => {
  it("books, then cancels", () => {
    const booking = useBookings
      .getState()
      .book({ venueId: "padel-hub-olaya", date: "2099-01-01", start: 600, duration: 60, price });

    expect(booking.id).toMatch(/^MB-[0-9A-Z]{6}$/);
    expect(useBookings.getState().bookings[0]).toMatchObject({ status: "confirmed" });

    useBookings.getState().cancel(booking.id);
    expect(useBookings.getState().bookings[0].status).toBe("cancelled");
  });

  it("returns the user's confirmed ranges for a venue and day", () => {
    const { book, cancel } = useBookings.getState();
    book({ venueId: "a", date: "2099-01-01", start: 600, duration: 90, price });
    const other = book({ venueId: "a", date: "2099-01-01", start: 900, duration: 60, price });
    book({ venueId: "b", date: "2099-01-01", start: 600, duration: 60, price });
    cancel(other.id);

    expect(myTakenRanges(useBookings.getState().bookings, "a", "2099-01-01")).toEqual([
      { start: 600, end: 690 },
    ]);
  });

  it("splits bookings into upcoming and past", () => {
    const base = {
      venueId: "a",
      duration: 60 as const,
      price,
      createdAt: "",
      status: "confirmed" as const,
    };
    const list: Booking[] = [
      { ...base, id: "late", date: "2026-11-21", start: 600 },
      { ...base, id: "soon", date: "2026-11-20", start: 900 },
      { ...base, id: "old", date: "2026-11-19", start: 600 },
      { ...base, id: "cancelled", date: "2026-11-22", start: 600, status: "cancelled" },
    ];
    const { upcoming, past } = splitByTime(list, new Date(2026, 10, 20, 12, 0));
    expect(upcoming.map((b) => b.id)).toEqual(["soon", "late"]);
    expect(past.map((b) => b.id)).toEqual(["cancelled", "old"]);
  });
});

describe("translations", () => {
  const paths = (value: unknown, prefix = ""): string[] =>
    typeof value === "string"
      ? [prefix]
      : Object.entries(value as object).flatMap(([k, v]) =>
          paths(v, prefix ? `${prefix}.${k}` : k),
        );
  const get = (obj: unknown, path: string) =>
    path
      .split(".")
      .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], obj) as string;
  const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

  it("Arabic and English have the same keys and placeholders", () => {
    expect(paths(strings.ar).sort()).toEqual(paths(strings.en).sort());
    for (const path of paths(strings.en)) {
      expect([path, placeholders(get(strings.ar, path))]).toEqual([
        path,
        placeholders(get(strings.en, path)),
      ]);
    }
  });
});
