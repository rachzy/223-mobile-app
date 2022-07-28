import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  Button,
  Platform,
  StyleSheet,
  TouchableHighlight,
  Alert,
} from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

Notifications.setNotificationCategoryAsync("reply", [
  {
    buttonTitle: "Enviar 2623",
    identifier: "reply",
    options: {
      isAuthenticationRequired: false,
      opensAppToForeground: false,
      isDestructive: true,
    },
  },
]);

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Response: ", response);
        if (response.actionIdentifier === "reply") {
          const { userToken } = response.notification.request.content.data;
          send2623Notification(userToken);
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableHighlight
        onPress={async () => {
          await send223Notification(expoPushToken);
        }}
      >
        <View style={styles.mainButton}>
          <Text style={styles.buttonLabel}>Enviar um 223 {"<"}3</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "space-around",
  },
  mainButton: {
    width: 300,
    height: 300,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 500,
  },
  buttonLabel: {
    color: "white",
    fontSize: 30,
  },
});

// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
async function send223Notification(expoPushToken) {
  const message = {
    to: "ExponentPushToken[7hB04_IbU74xq3gefJ6183]",
    sound: "default",
    title: "Flah te enviou um 223",
    body: "<3",
    data: { userToken: expoPushToken },
    priority: "high",
    _displayInForeground: true,
    _category: "reply",
    categoryId: "reply",
  };

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    Alert.alert("Sucesso!", "O Laranjinha recebeu seu 223 <3");
  } catch (err) {
    Alert.alert(
      "Oops",
      "Ocorre um erro ao tentar enviar um 223 pro Laranjinha :("
    );
    console.log(err);
  }
}

async function send2623Notification(userToken) {
  console.log("sending 2623...");
  const message = {
    to: userToken,
    sound: "default",
    title: "Laranjinha respondeu!",
    body: "2623 <3",
    data: { userToken: userToken },
    priority: "high",
    _displayInForeground: true,
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
