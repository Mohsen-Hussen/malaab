import { Stack, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VenueArt } from "@/components/VenueCard";
import { Button, Card, Chip, EmptyState, Icon, SectionTitle, amenityIcon } from "@/components/ui";
import { myTakenRanges, useBookings } from "@/features/booking/store";
import {
  DURATIONS,
  buildSlots,
  formatSAR,
  formatTime,
  fromDateKey,
  nextDays,
  priceFor,
  type Duration,
} from "@/features/booking/slots";
import { getVenue } from "@/features/venues/data";
import { useI18n } from "@/i18n";
import { colors, radius, space } from "@/theme";

export default function VenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const venue = getVenue(id);
  const { s, t, language } = useI18n();
  const insets = useSafeAreaInsets();

  const days = useMemo(() => nextDays(7), []);
  const [date, setDate] = useState(days[0]);
  const [duration, setDuration] = useState<Duration>(60);
  const [start, setStart] = useState<number | null>(null);

  const bookings = useBookings((state) => state.bookings);
  const book = useBookings((state) => state.book);

  const slots = useMemo(
    () => (venue ? buildSlots(venue, date, duration, myTakenRanges(bookings, venue.id, date)) : []),
    [venue, date, duration, bookings],
  );

  if (!venue) {
    return <EmptyState icon="map-marker-outline" title={s.venue.notFound} />;
  }

  const selected = start !== null && slots.some((slot) => slot.start === start && slot.available);
  const price = selected ? priceFor(venue, start!, duration) : null;
  const locale = language === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB";

  const confirm = () => {
    if (!selected || !price) return;
    const booking = book({ venueId: venue.id, date, start: start!, duration, price });
    router.replace({ pathname: "/booking/[id]", params: { id: booking.id } });
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: venue.name[language] }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <VenueArt venue={venue} height={170} />

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.name}>
            {venue.name[language]}
          </Text>
          <View style={styles.meta}>
            <Icon name="map-marker-outline" size={16} />
            <Text style={styles.metaText}>
              {venue.district[language]}
              {language === "ar" ? "، " : ", "}
              {s.cities[venue.city]}
            </Text>
            <Icon name="star" size={16} color="#F59E0B" />
            <Text style={styles.metaText}>{venue.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.meta}>
            <Icon name="clock-outline" size={16} />
            <Text style={styles.metaText}>
              {t(s.venue.hours, {
                open: formatTime(venue.open * 60),
                close: formatTime(venue.close * 60),
              })}
            </Text>
          </View>
          <View style={styles.amenities}>
            {venue.amenities.map((amenity) => (
              <View key={amenity} style={styles.amenity}>
                <Icon name={amenityIcon[amenity]} size={15} color={colors.primary} />
                <Text style={styles.amenityText}>{s.amenities[amenity]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>{s.venue.chooseDay}</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: space.sm }}
          >
            {days.map((day, index) => {
              const d = fromDateKey(day);
              const active = day === date;
              return (
                <Pressable
                  key={day}
                  testID={`day-${day}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={d.toLocaleDateString(locale, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                  onPress={() => {
                    setDate(day);
                    setStart(null);
                  }}
                  style={[styles.day, active && styles.daySelected]}
                >
                  <Text style={[styles.dayWeek, active && { color: "#fff" }]}>
                    {index === 0
                      ? s.venue.today
                      : d.toLocaleDateString(locale, { weekday: "short" })}
                  </Text>
                  <Text style={[styles.dayNum, active && { color: "#fff" }]}>{d.getDate()}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionTitle>{s.venue.duration}</SectionTitle>
          <View style={{ flexDirection: "row", gap: space.sm }}>
            {DURATIONS.map((value) => (
              <Chip
                key={value}
                label={t(s.venue.minutes, { count: value })}
                selected={duration === value}
                onPress={() => {
                  setDuration(value);
                  setStart(null);
                }}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>{s.venue.chooseTime}</SectionTitle>
          {slots.some((slot) => slot.available) ? (
            <View style={styles.slots}>
              {slots.map((slot) => {
                const active = slot.start === start;
                return (
                  <Pressable
                    key={slot.start}
                    testID={`slot-${formatTime(slot.start)}`}
                    accessibilityRole="button"
                    accessibilityLabel={formatTime(slot.start)}
                    accessibilityState={{ disabled: !slot.available, selected: active }}
                    disabled={!slot.available}
                    onPress={() => setStart(slot.start)}
                    style={[
                      styles.slot,
                      !slot.available && styles.slotTaken,
                      active && styles.slotSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        !slot.available && styles.slotTextTaken,
                        active && { color: "#fff" },
                      ]}
                    >
                      {formatTime(slot.start)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={styles.metaText}>{s.venue.noSlots}</Text>
          )}
          <Text style={[styles.metaText, { marginTop: space.md }]}>{s.venue.peakNote}</Text>
        </View>

        {price && (
          <View style={styles.section}>
            <Card>
              <SectionTitle>{s.venue.summary}</SectionTitle>
              <Row label={s.venue.base} value={formatSAR(price.base, language)} />
              {price.peakSurcharge > 0 && (
                <Row label={s.venue.peak} value={formatSAR(price.peakSurcharge, language)} />
              )}
              <Row label={s.venue.vat} value={formatSAR(price.vat, language)} />
              <View style={styles.divider} />
              <Row label={s.venue.total} value={formatSAR(price.total, language)} bold />
            </Card>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <Button
          testID="book-button"
          label={
            price
              ? t(s.venue.book, { price: formatSAR(price.total, language) })
              : s.venue.selectTime
          }
          disabled={!price}
          onPress={confirm}
        />
      </View>
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: space.lg, paddingTop: space.xl },
  name: { fontSize: 22, fontWeight: "800", color: colors.ink, marginBottom: space.sm },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  metaText: { fontSize: 14, color: colors.inkSoft },
  amenities: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.md },
  amenity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  amenityText: { fontSize: 12, fontWeight: "600", color: colors.primaryDark },
  day: {
    width: 62,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    gap: 2,
  },
  daySelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayWeek: { fontSize: 12, color: colors.inkSoft, fontWeight: "600" },
  dayNum: { fontSize: 18, color: colors.ink, fontWeight: "800" },
  slots: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  slot: {
    width: 76,
    height: 42,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  slotTaken: { backgroundColor: colors.background, borderColor: colors.background },
  slotSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontSize: 14, fontWeight: "700", color: colors.ink, fontVariant: ["tabular-nums"] },
  slotTextTaken: { color: colors.inkMuted, textDecorationLine: "line-through", fontWeight: "400" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  rowLabel: { fontSize: 14, color: colors.inkSoft },
  rowValue: { fontSize: 14, color: colors.ink },
  rowBold: { fontWeight: "800", color: colors.ink, fontSize: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.sm },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
