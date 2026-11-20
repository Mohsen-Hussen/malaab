import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatSAR } from "@/features/booking/slots";
import type { Venue } from "@/features/venues/data";
import { useI18n } from "@/i18n";
import { colors, radius, space } from "@/theme";
import { Icon, sportColor, sportIcon } from "./ui";

export function VenueArt({ venue, height = 110 }: { venue: Venue; height?: number }) {
  const tint = sportColor[venue.sport];
  return (
    <View style={[styles.art, { height, backgroundColor: tint }]}>
      {/* Simple court markings so cards are recognisable without stock photos. */}
      <View style={[styles.courtLine, { borderColor: "rgba(255,255,255,0.35)" }]} />
      <View style={styles.courtCircle} />
      <Icon name={sportIcon[venue.sport]} size={40} color="#fff" />
    </View>
  );
}

export function VenueCard({ venue }: { venue: Venue }) {
  const { s, language } = useI18n();
  return (
    <Link href={{ pathname: "/venue/[id]", params: { id: venue.id } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${venue.name[language]}, ${s.sports[venue.sport]}, ${s.cities[venue.city]}`}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      >
        <VenueArt venue={venue} />
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>
              {venue.name[language]}
            </Text>
            <View style={styles.rating}>
              <Icon name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{venue.rating.toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.meta}>
            <Icon name="map-marker-outline" size={15} />
            <Text style={styles.metaText}>
              {venue.district[language]}
              {language === "ar" ? "، " : ", "}
              {s.cities[venue.city]}
            </Text>
          </View>
          <View style={[styles.row, { marginTop: space.sm }]}>
            <Text style={styles.sport}>{s.sports[venue.sport]}</Text>
            <Text style={styles.price}>
              {formatSAR(venue.pricePerHour, language)}{" "}
              <Text style={styles.perHour}>{s.explore.perHour}</Text>
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  art: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  courtLine: { position: "absolute", top: 0, bottom: 0, left: "50%", borderLeftWidth: 2 },
  courtCircle: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  body: { padding: space.md, gap: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  name: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.ink },
  rating: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 13, fontWeight: "600", color: colors.ink },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13, color: colors.inkSoft },
  sport: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  price: { fontSize: 15, fontWeight: "700", color: colors.ink },
  perHour: { fontSize: 12, fontWeight: "400", color: colors.inkSoft },
});
