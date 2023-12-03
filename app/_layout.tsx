import { Suspense, useEffect, useState, useRef } from "react";
import { useColorScheme, Platform } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Redirect, Stack } from "expo-router";
import { TamaguiProvider, Text, Theme } from "tamagui";
import { Session } from '@supabase/supabase-js'
import { supabase } from "../utils/supabase";
import { MySafeAreaView } from "../components/MySafeAreaView";
import { HoldMenuProvider } from 'react-native-hold-menu';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import useUser from "../hooks/useUser";
import config from "../tamagui.config";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function sendPushNotification(expoPushToken: any) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants?.expoConfig?.extra?.eas.projectId,
    });
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token?.data;
}

export default function Layout() {
  const colorScheme = useColorScheme();
  const { user, session } = useUser();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<any>();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf")
  });

  // const [session, setSession] = useState<Session | null>(null)

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session)
  //   })

  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session)
  //   })
  // }, [])

  useEffect(() => {
    if (notificationListener && notificationListener.current) {
      registerForPushNotificationsAsync().then(token => setExpoPushToken(token as string));

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }
  }, []);

  useEffect(() => {
    if (expoPushToken) {
      sendPushNotification(expoPushToken)
    }
  }, [expoPushToken])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  // if (!session) return <Redirect href="/login" />

  return (

    <TamaguiProvider config={config}>
      <Suspense fallback={<Text>Loading...</Text>}>
        <Theme name={'dark'}>
          <ThemeProvider
            value={DarkTheme}
          >
            <HoldMenuProvider theme="dark" safeAreaInsets={{
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}>
              <Stack
                initialRouteName={session ? 'index' : 'login'}
                screenOptions={{
                  headerShown: false
                }}
              >
                <Stack.Screen
                  name="friend_map"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="share_profile"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                  }}
                />
              </Stack>
            </HoldMenuProvider>
          </ThemeProvider>
        </Theme>
      </Suspense>
    </TamaguiProvider>

  );
}