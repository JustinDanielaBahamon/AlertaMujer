import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ui/ScreenHeader/ScreenHeader";
import { useTheme } from "../../contexts/ThemeContext";

type Props = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: { title: string; description: string }[];
  backText: string;
};

/** Privacy policy and terms: same palette as the rest of the app (header, surface, accent, text). */
export default function PolicyDocument({ title, subtitle, icon, items, backText }: Props) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScreenHeader title={title} subtitle={subtitle} icon={icon} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: theme.containerBackground, borderColor: theme.contactCardBorder }]}>
          {items.map((item, i) => (
            <View key={item.title} style={[styles.item, i < items.length - 1 && { borderBottomColor: theme.contactDivider }]}>
              <Text style={[styles.itemTitle, { color: theme.contactAccent }]}>{item.title}</Text>
              <Text style={[styles.itemText, { color: theme.text }]}>{item.description}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.button, { backgroundColor: theme.contactAccent }]}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{backText}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20 },
  card: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 6 },
  item: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "transparent" },
  itemTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  itemText: { fontSize: 15, lineHeight: 22 },
  button: { marginTop: 20, paddingVertical: 14, borderRadius: 25, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
