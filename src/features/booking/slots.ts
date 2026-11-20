import type { Venue } from "../venues/data";

export const DURATIONS = [60, 90, 120] as const;
export type Duration = (typeof DURATIONS)[number];

/** Minutes between possible start times. */
export const SLOT_STEP = 30;

/** Evening hours (from 18:00) cost more. */
export const PEAK_START_HOUR = 18;
export const PEAK_MULTIPLIER = 1.25;
export const VAT_RATE = 0.15;

/** Free cancellation until this many hours before the start time. */
export const FREE_CANCELLATION_HOURS = 24;

export interface TimeRange {
  /** Minutes from midnight. */
  start: number;
  end: number;
}

/** Local date as YYYY-MM-DD. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string, minutes = 0): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, Math.floor(minutes / 60), minutes % 60);
}

export function nextDays(count: number, from: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    return toDateKey(date);
  });
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Small deterministic hash so "already booked" demo data is stable per venue and day. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Ranges already taken by other players (demo data). Roughly a third of the
 * hourly blocks are occupied, deterministically per venue and date.
 */
export function takenRanges(venue: Venue, dateKey: string): TimeRange[] {
  const ranges: TimeRange[] = [];
  for (let hour = venue.open; hour < venue.close; hour += 1) {
    if (hash(`${venue.id}:${dateKey}:${hour}`) % 3 === 0) {
      ranges.push({ start: hour * 60, end: hour * 60 + 60 });
    }
  }
  return ranges;
}

export interface Slot {
  start: number;
  available: boolean;
}

/**
 * All start times for a duration on a day. A slot is unavailable if it runs past
 * closing time, overlaps a taken range, or has already started.
 */
export function buildSlots(
  venue: Venue,
  dateKey: string,
  duration: Duration,
  extraTaken: TimeRange[] = [],
  now: Date = new Date(),
): Slot[] {
  const taken = [...takenRanges(venue, dateKey), ...extraTaken];
  const isToday = dateKey === toDateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const slots: Slot[] = [];

  for (let start = venue.open * 60; start + duration <= venue.close * 60; start += SLOT_STEP) {
    const range = { start, end: start + duration };
    const inPast = isToday && start <= nowMinutes;
    slots.push({ start, available: !inPast && !taken.some((t) => overlaps(range, t)) });
  }
  return slots;
}

export interface PriceBreakdown {
  /** All amounts in halalas. */
  base: number;
  peakSurcharge: number;
  vat: number;
  total: number;
}

/**
 * Price for a booking. Each minute is charged at the hourly rate, with the
 * peak multiplier applied to minutes from 18:00 onwards; VAT is added on top.
 */
export function priceFor(venue: Venue, start: number, duration: Duration): PriceBreakdown {
  const perMinute = venue.pricePerHour / 60;
  const peakFrom = PEAK_START_HOUR * 60;
  const peakMinutes = Math.max(0, start + duration - Math.max(start, peakFrom));

  const base = Math.round(perMinute * duration);
  const peakSurcharge = Math.round(perMinute * peakMinutes * (PEAK_MULTIPLIER - 1));
  const vat = Math.round((base + peakSurcharge) * VAT_RATE);
  return { base, peakSurcharge, vat, total: base + peakSurcharge + vat };
}

export function canCancelForFree(dateKey: string, start: number, now: Date = new Date()): boolean {
  const startsAt = fromDateKey(dateKey, start).getTime();
  return startsAt - now.getTime() >= FREE_CANCELLATION_HOURS * 60 * 60 * 1000;
}

export function formatSAR(halalas: number, locale: "ar" | "en"): string {
  const amount = new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(halalas / 100);
  return locale === "ar" ? `${amount} ر.س` : `SAR ${amount}`;
}
