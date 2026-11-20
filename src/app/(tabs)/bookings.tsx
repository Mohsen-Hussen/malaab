import { Link, router } from "expo-router";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";

import { Button, EmptyState, Icon, sportColor, sportIcon } from "@/components/ui";
import { formatSAR, formatTime, fromDateKey } from "@/features/booking/slots";
import { splitByTime, useBookings, type Booking } from "@/features/booking/store";
import { getVenue } from "@/features/venues/data";
import { useI18n } from "@/i18n";
import { colors, radius, space } from "@/theme";

export default function BookingsScreen() {
  const bookings = useBookings((state) => state.bookings);
  const { s } = useI18n();
  const { upcoming, past } = splitByTime(bookings);

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon="calendar-blank-outline"
        title={s.bookings.empty}
        body={s.bookings.emptyBody}
        action={<Button label={s.bookings.explore} onPress={() => router.navigate("/")} />}
      />
    );
  }

  const sections = [
    { title: s.bookings.upcoming, data: upcoming },
    { title: s.bookings.past, data: past },
  ].filter((section) => section.data.length > 0);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(b) => b.id}
      renderSectionHeader={({ section }) => (
        <Text accessibilityRole="header" style={styles.sectionHeader}>
          {section.title}
        </Text>
      )}
      renderItem={({ item }) => <BookingRow booking={item} />}
      ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
      contentContainerStyle={{ padding: space.lg, paddingTop: 0 }}
      stickySectionHeadersEnabled={false}
    />
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const { s, t, language } = useI18n();
  const venue = getVenue(booking.venueId);
  if (!venue) return null;
  const cancelled = booking.status === "cancelled";
  const locale = language === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB";
  const date = fromDateKey(booking.date).toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <Link href={{ pathname: "/booking/[id]", params: { id: booking.id } }} asChild>
      {/* Link's asChild hands `style` straight to the DOM on web, so it must be a single object. */}
      <Pressable
        accessibilityRole="link"
        style={StyleSheet.flatten([styles.row, cancelled && { opacity: 0.6 }])}
      >
        <View style={[styles.badge, { backgroundColor: sportColor[venue.sport] }]}>
          <Icon name={sportIcon[venue.sport]} color="#fff" size={22} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.name} numberOfLines={1}>
            {venue.name[language]}
          </Text>
          <Text style={styles.meta}>
            {date} ·{" "}
            {t(s.booking.timeRange, {
              start: formatTime(booking.start),
              end: formatTime(booking.start + booking.duration),
            })}
          </Text>
        </View>
        <Text style={[styles.status, cancelled && { color: colors.danger }]}>
          {cancelled ? s.booking.cancelled : formatSAR(booking.price.total, language)}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.inkSoft,
    paddingTop: space.xl,
    paddingBottom: space.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 15, fontWeight: "700", color: colors.ink },
  meta: { fontSize: 13, color: colors.inkSoft },
  status: { fontSize: 13, fontWeight: "700", color: colors.ink },
});
