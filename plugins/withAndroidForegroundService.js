const { withAndroidManifest } = require("@expo/config-plugins");

const withAndroidForegroundService = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Ensure service array exists
    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    // Find the Notifee ForegroundService
    let service = mainApplication.service.find(
      (s) => s.$["android:name"] === "app.notifee.core.ForegroundService"
    );

    // If it doesn't exist, we add it explicitly.
    // Usually autolinking adds it, but we can enforce it here to be safe.
    if (!service) {
      service = { $: { "android:name": "app.notifee.core.ForegroundService" } };
      mainApplication.service.push(service);
    }

    // CRITICAL: Prevent service from stopping when task is removed (swiped away)
    service.$["android:stopWithTask"] = "false";

    // Add the required foregroundServiceType="dataSync"
    service.$["android:foregroundServiceType"] = "dataSync";

    return config;
  });
};

module.exports = withAndroidForegroundService;
