import * as IntentLauncher from "expo-intent-launcher";
import * as Speech from "expo-speech";
import { useEffect } from "react";
import { Alert, Linking, Platform } from "react-native";

export const useTTSCheck = () => {
  useEffect(() => {
    checkTTSEngine();
  }, []);

  const checkTTSEngine = async () => {
    if (Platform.OS !== "android") return;

    try {
      const voices = await Speech.getAvailableVoicesAsync();

      // Look for a Google voice. The identifier usually contains "com.google.android.tts"
      // or the name contains "Google".
      const hasGoogleTTS = voices.some(
        (voice) =>
          (voice.identifier &&
            voice.identifier.includes("com.google.android.tts")) ||
          (voice.name && voice.name.toLowerCase().includes("google"))
      );

      if (!hasGoogleTTS) {
        showTTSConfigAlert();
      } else {
        console.log("Google TTS Engine detected.");
      }
    } catch (error) {
      console.error("Failed to check TTS engine:", error);
    }
  };

  const showTTSConfigAlert = () => {
    Alert.alert(
      "Cấu hình Giọng nói",
      "Ứng dụng hoạt động tốt nhất với 'Dịch vụ giọng nói của Google'. Vui lòng chọn Google làm công cụ ưu tiên trong cài đặt.",
      [
        {
          text: "Để sau",
          style: "cancel",
        },
        {
          text: "Mở Cài đặt",
          onPress: async () => {
            try {
              // Open Android Text-to-Speech Settings
              // Action: com.android.settings.TTS_SETTINGS
              await IntentLauncher.startActivityAsync(
                "com.android.settings.TTS_SETTINGS"
              );
            } catch (e) {
              console.error("Cannot open TTS settings:", e);
              // Fallback to general settings if specific intent fails
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };
};
