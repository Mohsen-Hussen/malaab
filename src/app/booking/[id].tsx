import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button, Card, EmptyState, Icon } from "@/components/ui";
import { canCancelForFree, formatSAR, formatTime, fromDateKey } from "@/features/booking/slots";
import { useBookings } from "@/features/booking/store";
import { getVenue } from "@/features/venues/data";
import { useI18n } from "@/i18n";
import { colors, radius, space } from "@/theme";

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const booking = useBookings((state) => state.bookings.find((b) => b.id === id));
  const cancel = useBookings((state) => state.cancel);
  const { s, t, language } = useI18n();

  const venue = booking ? getVenue(booking.venueId) : undefined;
  if (!booking || !venue) {
    return <EmptyState icon="ticket-confirmation-outline" title={s.booking.notFound} />;
  }

  const cancelled = booking.status === "cancelled";
  const cancellable = !cancelled && canCancelForFree(booking.date, booking.start);
  const locale = language === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB";
  const dateLabel = fromDateKey(booking.date).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Icon
          name={cancelled ? "close-circle-outline" : "check-circle"}
          size={56}
          color={cancelled ? colors.danger : colors.primary}
        />
        <Text accessibilityRole="header" style={styles.title}>
          {cancelled ? s.booking.cancelled : s.booking.confirmedTitle}
        </Text>
        {!cancelled && <Text style={styles.body}>{s.booking.confirmedBody}</Text>}
      </View>

      <Card style={{ gap: space.md }}>
        <View style={styles.code}>
          <Text style={styles.codeLabel}>{s.booking.reference}</Text>
          <Text testID="booking-code" style={styles.codeValue}>
            {booking.id}
          </Text>
        </View>
        <Detail label={s.booking.venue} value={venue.name[language]} />
        <Detail label={s.booking.date} value={dateLabel} />
        <Detail
          label={s.booking.time}
          value={t(s.booking.timeRange, {
            start: formatTime(booking.start),
            end: formatTime(booking.start + booking.duration),
          })}
        />
        <Detail label={s.booking.paid} value={formatSAR(booking.price.total, language)} />
      </Card>

      {!cancelled && (
        <View style={[styles.policy, !cancellable && { backgroundColor: colors.warningSoft }]}>
          <Icon name="information-outline" color={cancellable ? colors.primary : colors.warning} />
          <Text style={styles.policyText}>
            {cancellable ? s.booking.freeCancellation : s.booking.noCancellation}
          </Text>
        </View>
      )}

      <View style={{ gap: space.sm }}>
        <Button label={s.booking.viewAll} onPress={() => router.replace("/bookings")} />
        {cancellable && (
          <Button
            testID="cancel-booking"
            label={s.booking.cancel}
            variant="danger"
            onPress={() => cancel(booking.id)}
          />
        )}
      </View>
    </ScrollView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, gap: space.lg },
  hero: { alignItems: "center", gap: space.sm, paddingVertical: space.lg },
  title: { fontSize: 22, fontWeight: "800", color: colors.ink },
  body: { fontSize: 14, color: colors.inkSoft },
  code: {
    alignItems: "center",
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    gap: 2,
  },
  codeLabel: { fontSize: 12, color: colors.primaryDark, fontWeight: "600" },
  codeValue: { fontSize: 24, fontWeight: "800", color: colors.primaryDark, letterSpacing: 2 },
  detail: { flexDirection: "row", justifyContent: "space-between", gap: space.md },
  detailLabel: { fontSize: 14, color: colors.inkSoft },
  detailValue: { fontSize: 14, color: colors.ink, fontWeight: "600", flexShrink: 1 },
  policy: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  policyText: { flex: 1, fontSize: 13, color: colors.ink },
});
