import { useForegroundService } from "@/hooks/useForegroundService";

export function ForegroundServiceManager() {
  // Logic to auto-start service is inside the hook.
  // We keep this component mounted so the hook remains active.
  useForegroundService();

  // User requested to remove UI, so we return null.
  return null;
}
