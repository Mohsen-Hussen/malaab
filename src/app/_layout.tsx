import { LocaleProvider, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useI18n } from "@/i18n";
import { colors } from "@/theme";

export default function RootLayout() {
  const { s, isRTL, language } = useI18n();
  const direction = isRTL ? "rtl" : "ltr";

  return (
    <SafeAreaProvider>
      <LocaleProvider direction={direction}>
        {/* On web, `dir`/`lang` drive the layout direction; native uses I18nManager. */}
        <View
          style={{ flex: 1, backgroundColor: colors.background }}
          {...(Platform.OS === "web" ? { dir: direction, lang: language } : {})}
        >
          <Stack
            screenOptions={{
              headerTintColor: colors.ink,
              headerTitleStyle: { fontWeight: "700" },
              headerShadowVisible: false,
              headerStyle: { backgroundColor: colors.surface },
              contentStyle: { backgroundColor: colors.background },
              headerBackButtonDisplayMode: "minimal",
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: s.appName }} />
            <Stack.Screen name="venue/[id]" options={{ title: "" }} />
            <Stack.Screen
              name="booking/[id]"
              options={{ title: s.booking.reference, presentation: "modal" }}
            />
          </Stack>
          <StatusBar style="dark" />
        </View>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
