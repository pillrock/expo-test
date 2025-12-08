import { CodeGenerator } from "@/components/CodeGenerator";
import { ForegroundServiceManager } from "@/components/ForegroundServiceManager";
import { ServerConnection } from "@/components/ServerConnection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import TTSManager from "@/components/TTSManager";
import { ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ color: "#ECEDEE" }}>
          Loa Thông Báo
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.contentContainer}>
        <ThemedText style={styles.description}>
          Bản quyền thuộc về kienvu
        </ThemedText>

        <ServerConnection />

        <ForegroundServiceManager />

        <CodeGenerator />

        <TTSManager />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#151718",
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  contentContainer: {
    flex: 1,
  },
  description: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#9BA1A6",
  },
});
