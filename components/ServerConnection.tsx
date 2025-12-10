import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSocket } from "./SocketContext";
import { useTransaction } from "./TransactionContext";
import { ThemedText } from "./themed-text";

const FIXED_SERVER_URL = "https://fb6d22a49bfb.ngrok-free.app";
// const FIXED_SERVER_URL = "http://192.168.1.4:3000";

export function ServerConnection() {
  const { clientCode } = useTransaction();
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const { connect, connectionStatus } = useSocket();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    connect(FIXED_SERVER_URL);
  }, []);

  useEffect(() => {
    if (clientCode) {
      const codeNum = parseInt(clientCode, 10);
      if (!isNaN(codeNum)) {
        setVerificationCode(`CH${codeNum * 365}`);
      } else {
        setVerificationCode("");
      }
    } else {
      setVerificationCode("");
    }
  }, [clientCode]);

  const handleCopy = async () => {
    if (!verificationCode) return;
    await Clipboard.setStringAsync(verificationCode);
    setIsCopied(true);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setIsCopied(false));
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "#4CAF50";
      case "connecting":
        return "#FFC107";
      case "error":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Máy chủ OK";
      case "connecting":
        return "Máy chủ đang kết nối...";
      case "error":
        return "Máy chủ thất bại";
      default:
        return "Không kết nối";
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
          <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </ThemedText>
        </View>
      </View>

      {/* Verification Code Section */}
      {verificationCode ? (
        <View style={styles.verificationCard}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#4CAF50"
            />
          </View>
          <View style={styles.codeContent}>
            <ThemedText style={styles.label}>Mã xác thực</ThemedText>
            <TouchableOpacity
              style={styles.codeButton}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.codeText}>
                {verificationCode}
              </ThemedText>
              <Ionicons
                name={isCopied ? "checkmark" : "copy-outline"}
                size={18}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* Copied Toast/Badge */}
          <Animated.View style={[styles.copiedBadge, { opacity: fadeAnim }]}>
            <ThemedText style={styles.copiedText}>Đã sao chép</ThemedText>
          </Animated.View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <ThemedText style={styles.emptyText}>
            Vui lòng nhập mã Client để tạo mã xác thực
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  verificationCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  emptyCard: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  codeContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  codeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  codeText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginRight: 8,
    letterSpacing: 1,
  },
  copiedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  copiedText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
});
