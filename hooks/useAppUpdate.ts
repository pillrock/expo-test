import * as Updates from "expo-updates";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "ready"
  | "error";

export function useAppUpdate() {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [lastCheck, setLastCheck] = useState<number>(0);

  const checkForUpdates = useCallback(async (isManual = false) => {
    if (__DEV__) {
      console.log("Skipping update check in DEV mode");
      return;
    }

    try {
      setStatus("checking");
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setStatus("available");
      } else {
        setStatus("idle");
        if (isManual) {
          // Optional: Alert.alert('Up to date', 'You are using the latest version.');
        }
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      setStatus("error");
      // Reset to idle after a bit so the error doesn't stick forever
      setTimeout(() => setStatus("idle"), 5000);
    }
  }, []);

  const downloadUpdate = useCallback(async () => {
    try {
      setStatus("downloading");
      await Updates.fetchUpdateAsync();
      setStatus("ready");
    } catch (error) {
      console.error("Error downloading update:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  }, []);

  const reloadApp = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Error reloading app:", error);
    }
  }, []);

  // Auto-check on mount and when app comes to foreground
  useEffect(() => {
    checkForUpdates();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        const now = Date.now();
        // Check at most every 15 minutes to avoid spamming
        if (now - lastCheck > 15 * 60 * 1000) {
          checkForUpdates();
          setLastCheck(now);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkForUpdates, lastCheck]);

  return {
    status,
    checkForUpdates,
    downloadUpdate,
    reloadApp,
  };
}
