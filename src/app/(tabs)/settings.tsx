import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button, Card, Chip, SectionTitle } from "@/components/ui";
import { useBookings } from "@/features/booking/store";
import { changeLanguage, useI18n } from "@/i18n";
import { colors, space } from "@/theme";

export default function SettingsScreen() {
  const { s, language } = useI18n();
  const hasBookings = useBookings((state) => state.bookings.length > 0);
  const reset = useBookings((state) => state.reset);

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }}>
      <Card>
        <SectionTitle>{s.settings.language}</SectionTitle>
        <View style={{ flexDirection: "row", gap: space.sm }}>
          <Chip label="العربية" selected={language === "ar"} onPress={() => changeLanguage("ar")} />
          <Chip label="English" selected={language === "en"} onPress={() => changeLanguage("en")} />
        </View>
        <Text style={styles.hint}>{s.settings.languageHint}</Text>
      </Card>

      <Card>
        <SectionTitle>{s.settings.about}</SectionTitle>
        <Text style={styles.body}>{s.settings.aboutBody}</Text>
      </Card>

      {hasBookings && <Button label={s.settings.clear} variant="danger" onPress={reset} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: space.md, fontSize: 13, color: colors.inkSoft },
  body: { fontSize: 14, lineHeight: 21, color: colors.inkSoft },
});
