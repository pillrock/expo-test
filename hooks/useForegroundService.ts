import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import io from "socket.io-client";

export const useForegroundService = () => {
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const socketRef = useRef<any>(null);

  // Safely retrieve notifee module, returns null if native module is missing
  const getNotifee = () => {
    try {
      const notifee = require("@notifee/react-native").default;
      return notifee;
    } catch (e) {
      console.warn(
        "[useForegroundService] Notifee native module not found. " +
          "If you are in Expo Go, this is expected. " +
          "You must use a Development Build or Production Build for foreground services."
      );
      return null;
    }
  };

  // Auto-start service when app opens
  useEffect(() => {
    if (Platform.OS === "android") {
      checkAndAutoStart();
    }
  }, []);

  const checkAndAutoStart = async () => {
    // Small delay to ensure notifee is ready
    setTimeout(async () => {
      // Check if we can load notifee safely
      const notifee = getNotifee();
      if (!notifee) return;

      try {
        console.log("Auto-starting foreground service...");
        await startForegroundService();
      } catch (e) {
        console.log("Auto-start failed:", e);
      }
    }, 1000);
  };

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const notifee = getNotifee();
    if (!notifee) return;

    let unsubscribe: () => void;
    try {
      unsubscribe = notifee.onForegroundEvent(({ type, detail }: any) => {
        if (type === 3 && detail.pressAction?.id === "stop") {
          // ACTION_PRESS
          stopForegroundService();
        }
      });
    } catch (e) {
      console.warn("Error setting up Notifee listener:", e);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const requestBatteryOptimizations = async () => {
    if (Platform.OS !== "android") return;

    const notifee = getNotifee();
    if (!notifee) return;

    try {
      const batteryOptimizationEnabled =
        await notifee.isBatteryOptimizationEnabled();
      if (batteryOptimizationEnabled) {
        Alert.alert(
          "Cần quyền chạy nền",
          "Để ứng dụng hoạt động ổn định khi tắt màn hình, vui lòng tắt 'Tối ưu hóa pin' cho ứng dụng này.",
          [
            { text: "Để sau", style: "cancel" },
            {
              text: "Mở cài đặt",
              onPress: async () => {
                await notifee.openBatteryOptimizationSettings();
              },
            },
          ]
        );
      }
    } catch (e) {
      console.error("Battery optimization check failed:", e);
    }
  };

  const startForegroundService = async () => {
    if (Platform.OS !== "android") {
      alert("Foreground Service is only supported on Android.");
      return;
    }

    const notifeeModule = getNotifee();
    if (!notifeeModule) {
      alert(
        "Native module 'Notifee' not found. Please use a Development Build."
      );
      return;
    }

    try {
      // We need AndroidImportance from the module object itself, not sure if default export has it
      // Standard import: import notifee, { AndroidImportance } from ...
      // Here we used require.
      const rawModule = require("@notifee/react-native");
      const { AndroidImportance } = rawModule;

      // 1. Create channel
      const channelId = await notifeeModule.createChannel({
        id: "sticky_channel",
        name: "Background TTS Service",
        importance: AndroidImportance.HIGH,
      });

      // 2. Display notification to start service
      await notifeeModule.displayNotification({
        id: "foreground-service",
        title: "Ứng dụng báo tiền đang chạy",
        body: "Đang lắng nghe giao dịch...",
        android: {
          channelId,
          asForegroundService: true,
          ongoing: true, // Prevent swiping away
          color: "#4caf50",
          pressAction: {
            id: "default",
          },
          actions: [
            {
              title: "Tắt Service",
              pressAction: { id: "stop" },
            },
          ],
        },
      });

      setIsServiceRunning(true);

      // 3. Connect Socket within this context
      await connectBackgroundSocket();

      // 4. Request battery optimization disable if not already done
      requestBatteryOptimizations();
    } catch (error) {
      console.error("Failed to start foreground service:", error);
      setIsServiceRunning(false);
    }
  };

  const stopForegroundService = async () => {
    if (Platform.OS !== "android") return;

    const notifee = getNotifee();
    if (!notifee) return;

    try {
      await notifee.stopForegroundService();

      // Cleanup socket
      if (socketRef.current) {
        console.log("Stopping service: disconnecting socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      setIsServiceRunning(false);
    } catch (error) {
      console.error("Failed to stop foreground service:", error);
    }
  };

  const connectBackgroundSocket = async () => {
    try {
      const serverUrl = await AsyncStorage.getItem("server_url");
      if (!serverUrl) {
        console.log("No server URL found for background service");
        Speech.speak("Chưa cấu hình địa chỉ máy chủ");
        return;
      }

      // Clean up existing socket if any
      if (socketRef.current) {
        if (socketRef.current.connected) {
          console.log("Socket already connected, skipping reconnect.");
          return;
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      const socket = io(serverUrl, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Background Socket connected! ID:", socket.id);
        Speech.speak("Đã kết nối máy chủ");
      });

      socket.on("payment_received", async (data) => {
        console.log("Background Payment Received:", data);
        // Basic verification if needed, or just speak
        const storedCode = await AsyncStorage.getItem("client_code");
        // Loosen check slightly for testing, or ensure type safety
        if (
          storedCode &&
          data.clientCode &&
          String(data.clientCode) === String(storedCode)
        ) {
          const text =
            data.text || `Nhận ${data.transaction.transferAmount} đồng`;
          Speech.speak(text, { language: "vi-VN" });
        } else {
          console.log(
            `Background: Code mismatch. Received: ${data.clientCode}, Stored: ${storedCode}`
          );
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("Background Socket disconnected:", reason);
        if (reason === "io server disconnect") {
          socket.connect();
        }
      });

      socket.on("connect_error", (err) => {
        console.log("Background Socket connect error:", err);
      });
    } catch (e) {
      console.error("Error connecting background socket", e);
    }
  };

  // Expose this so UI can manually trigger it if needed
  const checkBattery = async () => {
    await requestBatteryOptimizations();
  };

  return {
    isServiceRunning,
    startForegroundService,
    stopForegroundService,
    checkBattery,
  };
};
