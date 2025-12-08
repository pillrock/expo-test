import { useForegroundService } from "@/hooks/useForegroundService";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

export function ForegroundServiceManager() {
  const { isServiceRunning, startForegroundService, stopForegroundService } =
    useForegroundService();

  const handleToggle = () => {
    if (isServiceRunning) {
      stopForegroundService();
    } else {
      startForegroundService();
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#E0E0E0"
            style={{ marginRight: 8 }}
          />
          <ThemedText type="defaultSemiBold" style={{ color: "#E0E0E0" }}>
            Chạy nền
          </ThemedText>
        </View>

        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isServiceRunning ? "#4CAF50" : "#757575" },
            ]}
          />
          <ThemedText
            style={[
              styles.statusText,
              { color: isServiceRunning ? "#4CAF50" : "#757575" },
            ]}
          >
            {isServiceRunning ? "Đang chạy" : "Đã dừng"}
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.description}>
          Giữ app chạy ngầm để phát âm thanh khi tắt màn hình.
        </ThemedText>

        <TouchableOpacity
          style={[
            styles.button,
            isServiceRunning ? styles.buttonStop : styles.buttonStart,
          ]}
          onPress={handleToggle}
        >
          <Ionicons
            name={
              isServiceRunning ? "stop-circle-outline" : "play-circle-outline"
            }
            size={24}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <ThemedText style={styles.buttonText}>
            {isServiceRunning ? "Dừng chạy nền" : "Bật chạy nền"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#333",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    marginTop: 4,
  },
  description: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonStart: {
    backgroundColor: "#2196F3",
  },
  buttonStop: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
