import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Set Android notification channel once (usually at app start)
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF00FF",
  });
}

// Helper function
export async function sendNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: "#4F46E5",
    },
    trigger: null, // triggers immediately
  });
}
