import { useState, useEffect, useRef } from "react";
import { Github, Twitter, Circle, Send } from "@tamagui/lucide-icons";
import { Link, useRouter, Redirect } from "expo-router";
import { PanResponder, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withTiming } from 'react-native-reanimated';
import { View, Input } from "tamagui";
import {
  Button,
  H1,
  ListItem,
  Paragraph,
  Separator,
  YGroup,
  YStack,
  XStack
} from "tamagui";
import Swiper from 'react-native-swiper'
import { Session } from '@supabase/supabase-js'
import fetch from 'cross-fetch';
import Post, { PostType } from "../components/Post";
import HubItems from "../components/HubItems";
import { supabase, getPosts } from "../utils/supabase";
import useUser from "../hooks/useUser";
import FriendMap from "../components/FriendMap";
import MyCircle from "../components/MyCircle";
import { MySafeAreaView } from "../components/MySafeAreaView";

// import { MyStack } from "../components/MyStack";

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default function Home() {
  const router = useRouter();
  const { user, session, loading } = useUser()
  const [posts, setPosts] = useState<PostType[]>([])
  const [isRevealing, setIsRevealing] = useState(false)
  // const translateY = useRef(new Animated.Value(-height)).current;
  const circleHeight = useSharedValue(50);
  const circleWidth = useSharedValue(50);
  const circleBorderRadius = useSharedValue(25);
  const transformY = useSharedValue(0);
  const hubOpacity = useSharedValue(0);
  const feedOpacity = useSharedValue(1);

  const animatedHubStyle = useAnimatedStyle(() => ({
    // transform: [{ translateY: translateY.value }],
    opacity: hubOpacity.value,
    transform: [{ translateY: transformY.value }],
  }));

  const animatedFeedStyle = useAnimatedStyle(() => ({
    // transform: [{ translateY: translateY.value }],
    opacity: feedOpacity.value,
    transform: [{ translateY: transformY.value }],
  }));

  const circleStyle = useAnimatedStyle(() => ({
    height: circleHeight.value,
    width: circleWidth.value,
    borderRadius: circleBorderRadius.value,
  }));

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onPanResponderMove: (evt, gestureState) => {
      'worklet';
      if (gestureState.dy > 0) {
        transformY.value = gestureState.dy / 2;
        // translateY.setValue(gestureState.dy);
        if (isRevealing) {
          hubOpacity.value = (1 - gestureState.dy * 10 / height);  // Calculate opacity based on drag position
          feedOpacity.value = (gestureState.dy * 10 / height);
          circleHeight.value = (height - gestureState.dy * 2);
          circleWidth.value = (width - gestureState.dy * 2);
          circleBorderRadius.value = (gestureState.dy);
        } else {
          hubOpacity.value = (gestureState.dy * 10 / height);  // Calculate opacity based on drag position
          feedOpacity.value = (1 - gestureState.dy * 10 / height);
          circleHeight.value = (50 + gestureState.dy * 2);
          circleWidth.value = (50 + gestureState.dy * 2);
          circleBorderRadius.value = (gestureState.dy);
        }
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      'worklet';
      transformY.value = withTiming(0, { duration: 200 });
      if (gestureState.dy > 50 && isRevealing) {  // If swipe up is significant and view is open
        hubOpacity.value = withTiming(0, { duration: 200 }, (isFinished) => {
          if (isFinished) {
            runOnJS(setIsRevealing)(false);
          }
        });
        feedOpacity.value = withTiming(1, { duration: 200 }, (isFinished) => {
          if (isFinished) {
            runOnJS(setIsRevealing)(false);
          }
        });

      } else if (gestureState.dy > 50 && !isRevealing) {  // If swipe down is significant and view is closed
        circleHeight.value = withTiming(height, { duration: 200 });
        circleWidth.value = withTiming(width, { duration: 200 });
        circleBorderRadius.value = withTiming(0, { duration: 200 });
        hubOpacity.value = withTiming(1, { duration: 200 }, (isFinished) => {
          if (isFinished) {
            runOnJS(setIsRevealing)(true);
          }
          // setIsRevealing(true);
        });
        feedOpacity.value = withTiming(0, { duration: 200 }, (isFinished) => {
          if (isFinished) {
            runOnJS(setIsRevealing)(true);
          }
          // setIsRevealing(true);
        });
      } else {  // Reset to the current state if the swipe is not significant
        // Animated.spring(translateY, {
        //   toValue: isRevealing ? 0 : -500,
        //   useNativeDriver: true,
        // }).start();
        hubOpacity.value = isRevealing ? 1 : 0;
        feedOpacity.value = isRevealing ? 0 : 1;
      }
    },
  });

  useEffect(() => {
    console.log("session", session)
    if ((session && !session?.access_token) || !loading && !session) {
      router.replace('/login')
    }
  }, [session, loading])

  // async function getPosts() {
  //   const response = await fetch(`${process.env.API_URL}/api/get-posts`, {
  //     method: 'GET',
  //     credentials: 'include',
  //     headers: {
  //       'access_token': session?.access_token as string,
  //       'refresh_token': session?.refresh_token as string,
  //     }
  //   })

  //   console.log(response, session?.user)
  // }

  async function fetchPosts() {
    const { data, error } = await getPosts(user.id)
    if (data) {
      // @ts-ignore
      setPosts(data)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user])

  return (
    <MySafeAreaView>

      <Swiper
        loop={false}
        showsPagination={false}
        index={1}
        {...panResponder.panHandlers}>
        <YStack flex={1}>
          <MyCircle />

        </YStack>
        <YStack>
          <Animated.View style={
            [animatedHubStyle,
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: height,
                zIndex: isRevealing ? 1 : -1,
                paddingTop: 70,
                width: '100%',
              }]
          }>
            <Input
              placeholder="Search"
              size="$5"
            />
            <HubItems />
          </Animated.View>
          <XStack
            space="$1"
            maxWidth={600}
            justifyContent="center"
            width="100%"
          >
            {/* <Button circular backgroundColor="transparent" size="$5" scaleIcon={1.4} icon={Circle}>
          </Button> */}
            <Animated.View
              // style={[circleStyle, {
              //   borderRadius: 25,
              //   borderWidth: 2,
              //   borderColor: 'white',
              // }]}
              style={{
                height: 60,
                width: 60,
                borderRadius: 100,
                borderWidth: 4,
                borderColor: 'white',
              }}
            >
            </Animated.View>
          </XStack>
          <Animated.View style={
            [animatedFeedStyle,
              {
                zIndex: isRevealing ? -1 : 1,
                width: '100%',
              }]
          }>

            <YStack
              space="$4"
              maxWidth={600}
              marginTop={20}
            >
              {posts.map((post) => (
                <Post key={post.id} post={post} />
              ))}
            </YStack>
          </Animated.View>
          {/* <YStack
        space="$4"
        maxWidth={600}
      >
        <H1 textAlign="center">Welcome to Tamagui.</H1>
        <Paragraph textAlign="center">
          Here&apos;s a basic starter to show navigating from one screen to
          another.
        </Paragraph>
      </YStack>

      <YStack space="$2.5">
        <Button onPress={() => router.push("/users/testuser")}>
          Go to user page
        </Button>
        <Button onPress={() => router.push("/tabs")}>Go to tabs page</Button>
      </YStack>

      <YStack space="$5">
        <YGroup
          bordered
          separator={<Separator />}
          theme="green"
        >
          <YGroup.Item>
            <Link
              asChild
              href="https://twitter.com/natebirdman"
              target="_blank"
            >
              <ListItem
                hoverTheme
                title="Nate"
                pressTheme
                icon={Twitter}
              />
            </Link>
          </YGroup.Item>
          <YGroup.Item>
            <Link
              asChild
              href="https://github.com/tamagui/tamagui"
              target="_blank"
            >
              <ListItem
                hoverTheme
                pressTheme
                title="Tamagui"
                icon={Github}
              />
            </Link>
          </YGroup.Item>
          <YGroup.Item>
            <Link
              asChild
              href="https://github.com/ivopr/tamagui-expo"
              target="_blank"
            >
              <ListItem
                hoverTheme
                pressTheme
                title="This Template"
                icon={Github}
              />
            </Link>
          </YGroup.Item>
        </YGroup>
      </YStack> */}
        </YStack>
      </Swiper>
    </MySafeAreaView>

  );
}