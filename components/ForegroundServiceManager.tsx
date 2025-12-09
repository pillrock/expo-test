import { useForegroundService } from "@/hooks/useForegroundService";
import { useTTSCheck } from "@/hooks/useTTSCheck";

export function ForegroundServiceManager() {
  // Logic to auto-start service is inside the hook.
  // We keep this component mounted so the hook remains active.
  useForegroundService();

  // Check for Google TTS engine and prompt user if missing
  useTTSCheck();

  // User requested to remove UI, so we return null.
  return null;
}
