import { useAppUpdate } from "@/hooks/useAppUpdate";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function UpdateBanner() {
  const { status, downloadUpdate, reloadApp } = useAppUpdate();
  const insets = useSafeAreaInsets();

  // Only show for specific statuses
  const isVisible = ["available", "downloading", "ready"].includes(status);

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      exiting={FadeOutUp.duration(300)}
      style={[styles.container, { paddingTop: insets.top + 8 }]}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          {status === "available" && (
            <View style={styles.row}>
              <Ionicons
                name="cloud-download-outline"
                size={16}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.text}>Có bản cập nhật mới</Text>
            </View>
          )}
          {status === "downloading" && (
            <View style={styles.row}>
              <Ionicons
                name="sync"
                size={16}
                color="#fff"
                style={styles.iconSpoke}
              />
              <Text style={styles.text}>Đang tải xuống...</Text>
            </View>
          )}
          {status === "ready" && (
            <View style={styles.row}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#4CAF50"
                style={styles.icon}
              />
              <Text
                style={[styles.text, { color: "#4CAF50", fontWeight: "bold" }]}
              >
                Cập nhật đã sẵn sàng
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {status === "available" && (
            <TouchableOpacity onPress={downloadUpdate} style={styles.button}>
              <Text style={styles.buttonText}>Tải về</Text>
            </TouchableOpacity>
          )}
          {status === "ready" && (
            <TouchableOpacity
              onPress={reloadApp}
              style={[styles.button, styles.restartButton]}
            >
              <Text style={styles.buttonText}>Khởi động lại</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(20, 20, 20, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 12,
    zIndex: 9999,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    maxWidth: 400,
  },
  textContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  iconSpoke: {
    // Could animate rotation here later for extra polish
    marginRight: 8,
  },
  text: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  button: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#555",
  },
  restartButton: {
    backgroundColor: "#fff",
  },
  buttonText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
});
