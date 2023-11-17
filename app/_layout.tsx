import { Suspense, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
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
import useUser from "../hooks/useUser";
import config from "../tamagui.config";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const colorScheme = useColorScheme();
  const { user, session } = useUser();

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
          </ThemeProvider>
        </Theme>
      </Suspense>
    </TamaguiProvider>
  );
}