import { Tabs } from "expo-router/tabs";
import { Platform } from "react-native";

import { Icon } from "@/components/ui";
import { useI18n } from "@/i18n";
import { colors } from "@/theme";

export default function TabsLayout() {
  const { s } = useI18n();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, fontWeight: "600" },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "700" },
        sceneStyle: { backgroundColor: colors.background },
        // Browsers have no bottom safe-area inset, so give labels room on web.
        ...(Platform.OS === "web" && { tabBarStyle: { height: 64 } }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: s.tabs.explore,
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="compass-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: s.tabs.bookings,
          tabBarIcon: ({ color, size }) => (
            <Icon name="ticket-confirmation-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: s.tabs.settings,
          tabBarIcon: ({ color, size }) => <Icon name="cog-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
