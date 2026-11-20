import { fireEvent, renderRouter, screen } from "expo-router/testing-library";

import { useBookings } from "@/features/booking/store";
import { useLanguageStore } from "@/i18n";

beforeEach(() => {
  useLanguageStore.getState().setLanguage("en");
  useBookings.getState().reset();
});

describe("booking flow", () => {
  it("filters the venue list by sport", async () => {
    await renderRouter("./src/app", { initialUrl: "/" });

    expect(await screen.findByText("8 venues")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Tennis" }));
    expect(await screen.findByText("1 venue")).toBeTruthy();
    expect(screen.getByText("Ace Tennis Center")).toBeTruthy();
  });

  it("books a slot and shows the confirmation", async () => {
    const router = await renderRouter("./src/app", { initialUrl: "/venue/padel-hub-olaya" });

    const book = await screen.findByTestId("book-button");
    expect(book).toBeDisabled();

    // Pick the second day (tomorrow) so no slot has already passed.
    await fireEvent.press(screen.getAllByTestId(/^day-/)[1]);
    const freeSlot = screen
      .getAllByTestId(/^slot-/)
      .find((slot) => !slot.props.accessibilityState?.disabled)!;
    await fireEvent.press(freeSlot);

    expect(await screen.findByText("Booking summary")).toBeTruthy();
    await fireEvent.press(screen.getByTestId("book-button"));

    const [booking] = useBookings.getState().bookings;
    expect(booking).toMatchObject({ venueId: "padel-hub-olaya", status: "confirmed" });
    expect(router.getPathname()).toBe(`/booking/${booking.id}`);
    expect(await screen.findByText("You're booked!")).toBeTruthy();
    expect(screen.getByTestId("booking-code")).toHaveTextContent(booking.id);
  });
});
