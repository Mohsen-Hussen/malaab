import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Duration, PriceBreakdown, TimeRange } from "./slots";

export interface Booking {
  id: string;
  venueId: string;
  /** YYYY-MM-DD */
  date: string;
  /** Minutes from midnight. */
  start: number;
  duration: Duration;
  price: PriceBreakdown;
  createdAt: string;
  status: "confirmed" | "cancelled";
}

export type NewBooking = Omit<Booking, "id" | "createdAt" | "status">;

interface BookingState {
  bookings: Booking[];
  book: (booking: NewBooking) => Booking;
  cancel: (id: string) => void;
  reset: () => void;
}

export function bookingId(random: () => number = Math.random): string {
  const code = Math.floor(random() * 36 ** 6)
    .toString(36)
    .toUpperCase()
    .padStart(6, "0");
  return `MB-${code}`;
}

export const useBookings = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      book: (input) => {
        const booking: Booking = {
          ...input,
          id: bookingId(),
          createdAt: new Date().toISOString(),
          status: "confirmed",
        };
        set((state) => ({ bookings: [booking, ...state.bookings] }));
        return booking;
      },
      cancel: (id) =>
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
        })),
      reset: () => set({ bookings: [] }),
    }),
    {
      name: "malaab:bookings",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

/** The user's own confirmed bookings for a venue and day, so they show as taken. */
export function myTakenRanges(bookings: Booking[], venueId: string, date: string): TimeRange[] {
  return bookings
    .filter((b) => b.status === "confirmed" && b.venueId === venueId && b.date === date)
    .map((b) => ({ start: b.start, end: b.start + b.duration }));
}

export function splitByTime(bookings: Booking[], now: Date = new Date()) {
  const key = (b: Booking) => `${b.date} ${String(b.start).padStart(4, "0")}`;
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")} ${String(now.getHours() * 60 + now.getMinutes()).padStart(4, "0")}`;

  const upcoming = bookings
    .filter((b) => b.status === "confirmed" && key(b) >= nowKey)
    .sort((a, b) => key(a).localeCompare(key(b)));
  const past = bookings
    .filter((b) => b.status === "cancelled" || key(b) < nowKey)
    .sort((a, b) => key(b).localeCompare(key(a)));
  return { upcoming, past };
}
