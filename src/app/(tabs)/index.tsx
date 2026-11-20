import { useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VenueCard } from "@/components/VenueCard";
import { Chip, EmptyState, Icon, sportIcon } from "@/components/ui";
import {
  cities,
  filterVenues,
  sports,
  venues,
  type City,
  type Sport,
} from "@/features/venues/data";
import { useI18n } from "@/i18n";
import { colors, radius, space } from "@/theme";

export default function ExploreScreen() {
  const { s, t } = useI18n();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState<Sport | undefined>();
  const [city, setCity] = useState<City | undefined>();

  const results = useMemo(() => filterVenues(venues, { query, sport, city }), [query, sport, city]);

  const header = (
    <View style={{ gap: space.md, paddingTop: insets.top + space.lg }}>
      <View style={{ paddingHorizontal: space.lg, gap: 4 }}>
        <Text accessibilityRole="header" style={styles.title}>
          {s.explore.greeting}
        </Text>
        <Text style={styles.subtitle}>{s.explore.subtitle}</Text>
      </View>

      <View style={styles.search}>
        <Icon name="magnify" size={20} color={colors.inkMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={s.explore.searchPlaceholder}
          placeholderTextColor={colors.inkMuted}
          accessibilityLabel={s.explore.searchLabel}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip label={s.explore.all} selected={!sport} onPress={() => setSport(undefined)} />
        {sports.map((value) => (
          <Chip
            key={value}
            label={s.sports[value]}
            icon={sportIcon[value]}
            selected={sport === value}
            onPress={() => setSport(sport === value ? undefined : value)}
          />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip label={s.explore.allCities} selected={!city} onPress={() => setCity(undefined)} />
        {cities.map((value) => (
          <Chip
            key={value}
            label={s.cities[value]}
            selected={city === value}
            onPress={() => setCity(city === value ? undefined : value)}
          />
        ))}
      </ScrollView>

      <Text accessibilityLiveRegion="polite" style={styles.count}>
        {results.length === 1
          ? s.explore.resultOne
          : t(s.explore.results, { count: results.length })}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={results}
      keyExtractor={(venue) => venue.id}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: space.lg }}>
          <VenueCard venue={item} />
        </View>
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={<EmptyState icon="whistle" title={s.explore.empty} />}
      ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
      contentContainerStyle={{ paddingBottom: space.xxl }}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: colors.ink },
  subtitle: { fontSize: 14, color: colors.inkSoft },
  search: {
    marginHorizontal: space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    height: 48,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.ink, height: "100%" },
  chips: { gap: space.sm, paddingHorizontal: space.lg },
  count: { paddingHorizontal: space.lg, fontSize: 13, color: colors.inkSoft },
});
