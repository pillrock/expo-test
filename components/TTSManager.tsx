import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { useTransaction } from "./TransactionContext";
import { ThemedText } from "./themed-text";

export default function TTSManager() {
  const [isEnabled, setIsEnabled] = useState(true);
  const { lastTransaction } = useTransaction();
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);

  useEffect(() => {
    // Configure audio mode to play even if switch is on silent
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch((err) => console.warn("Audio mode setup failed", err));
  }, []);

  useEffect(() => {
    if (lastTransaction) {
      const speechText = `Đã nhận ${lastTransaction.amount} đồng`;

      setDisplayMessage(speechText);
      console.log("TTS Triggered:", speechText);

      if (isEnabled) {
        speak(speechText);
      }
    }
  }, [lastTransaction]);

  const playSound = async () => {
    try {
      // Using a generic 'ding' sound URL.
      // replace with require('@/assets/ding.mp3') if you add a local file.
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/ding.mp3"),
        { shouldPlay: true }
      );

      // Unload sound from memory when finished
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });

      // Wait a short moment for the sound to be perceived before speaking
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

  const speak = async (text: string) => {
    // Stop any current speech
    // if (await Speech.isSpeakingAsync()) {
    //   Speech.stop();
    // }

    // Play "Ting Ting" sound
    await playSound();

    Speech.speak(text, {
      language: "vi-VN",
      pitch: 1.0, // Slightly more natural pitch
      rate: 0.9, // Slightly slower for clarity
    });
  };

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#E0E0E0"
            style={{ marginRight: 8 }}
          />
          <ThemedText type="defaultSemiBold" style={{ color: "#E0E0E0" }}>
            Đọc tin nhắn
          </ThemedText>
        </View>
        <Switch
          trackColor={{ false: "#3e3e3e", true: "#1565C0" }}
          thumbColor={isEnabled ? "#2196F3" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>

      {displayMessage ? (
        <View style={styles.messageBubble}>
          <View style={styles.messageHeader}>
            <ThemedText style={styles.messageLabel}>Tin nhắn cuối:</ThemedText>
            <TouchableOpacity
              onPress={() => speak(displayMessage)}
              hitSlop={10}
            >
              <Ionicons name="volume-high-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.messageText}>{displayMessage}</ThemedText>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            Đang chờ giao dịch...
          </ThemedText>
        </View>
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageBubble: {
    backgroundColor: "#2C2C2C",
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    marginTop: 8,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  messageLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
  },
  messageText: {
    fontSize: 16,
    color: "#E0E0E0",
    lineHeight: 24,
  },
  emptyContainer: {
    padding: 10,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
});
