import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ColorValue,
  type ViewStyle,
} from "react-native";

import type { Amenity, Sport } from "@/features/venues/data";
import { colors, radius, space } from "@/theme";

export type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export const sportIcon: Record<Sport, IconName> = {
  football: "soccer",
  padel: "racquetball",
  basketball: "basketball",
  tennis: "tennis",
};

export const sportColor: Record<Sport, string> = {
  football: "#0B7A58",
  padel: "#1D4ED8",
  basketball: "#C2410C",
  tennis: "#7C3AED",
};

export const amenityIcon: Record<Amenity, IconName> = {
  parking: "parking",
  showers: "shower-head",
  lights: "lightbulb-on-outline",
  cafe: "coffee-outline",
  indoor: "home-roof",
};

export function Icon({
  name,
  size = 18,
  color = colors.inkSoft,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
}) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      // Tab bars pass a ColorValue (possibly null or a number); the icon wants a string.
      color={typeof color === "string" ? color : colors.inkSoft}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  style?: ViewStyle;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  icon,
  style,
  testID,
}: ButtonProps) {
  const fg = variant === "primary" ? "#fff" : variant === "danger" ? colors.danger : colors.ink;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && { backgroundColor: colors.primary },
        variant === "secondary" && styles.buttonOutline,
        variant === "danger" && [styles.buttonOutline, { borderColor: colors.danger }],
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} color={fg} /> : null}
      <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
}

export function Chip({ label, selected, onPress, icon }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon && <Icon name={icon} size={16} color={selected ? "#fff" : colors.inkSoft} />}
      <Text style={[styles.chipLabel, selected && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.sectionTitle}>
      {children}
    </Text>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <Icon name={icon} size={44} color={colors.inkMuted} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  buttonOutline: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  buttonLabel: { fontSize: 16, fontWeight: "700" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipLabel: { fontSize: 14, fontWeight: "600", color: colors.ink },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.ink, marginBottom: space.md },
  empty: { alignItems: "center", gap: space.sm, paddingVertical: 56, paddingHorizontal: space.xl },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.ink, marginTop: space.sm },
  emptyBody: { fontSize: 14, color: colors.inkSoft, textAlign: "center", marginBottom: space.md },
});
