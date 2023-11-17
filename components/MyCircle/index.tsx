import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native';
import {
  Scan, QrCode, User
} from '@tamagui/lucide-icons';
import { View, ScrollView, Button, Avatar, Text, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import useUser from '../../hooks/useUser';

const { width, height } = Dimensions.get('window');
const CENTER = { x: width / 2, y: height / 2 };

interface CircleItemProps {
  style: Animated.WithAnimatedValue<{}>;
}

const CircleItem: React.FC<CircleItemProps> = ({ style }) => {
  return (
    <Animated.View style={[styles.circleItem, style]} />
  );
};

const CirclesView: React.FC = () => {
  const { user, session } = useUser()
  const router = useRouter();
  // const [people, setPeople] = useState<null[]>(Array.from({ length: 150 }, () => null));
  const [people, setPeople] = useState<any[]>(user?.circle?.members || []);
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);

  useEffect(() => {
    if (user?.circle?.members) {
      const count = user?.circle?.members.length
      const fill = 150 - count
      setPeople([...user?.circle?.members, ...Array.from({ length: fill }, () => null)])
    }
  }, [user])

  useEffect(() => {
    setAnimatedValues(people.map(() => new Animated.Value(0)));
  }, [people]);

  const addPerson = () => {
    // generate 150 random people
    // const newPeople = Array.from({ length: 150 }, () => null);
    // setPeople([...newPeople]);

    // Animate the new item
    const newAnimatedValue = new Animated.Value(0);
    setAnimatedValues([...animatedValues, newAnimatedValue]);
    Animated.spring(newAnimatedValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const calculatePositionWithGap = (index: number, itemDiameter: number, gap: number) => {
    const itemRadius = itemDiameter / 2;
    const centerToCenterDistance = itemDiameter + gap; // Distance between the centers of two adjacent items

    if (index === 0) {
      // Center item
      return { x: CENTER.x - itemRadius, y: CENTER.y - itemRadius };
    }

    let circleIndex = 0;
    let itemsOnCurrentCircle = 6; // 6 items on the first circle
    let totalItemsOnPreviousCircles = 1; // Including the center item

    // Find out which circle the item is on
    while (index >= totalItemsOnPreviousCircles + itemsOnCurrentCircle) {
      totalItemsOnPreviousCircles += itemsOnCurrentCircle;
      circleIndex++;
      itemsOnCurrentCircle = 6 * circleIndex; // 6 more items for each new circle
    }

    // The radius for the current circle
    // For the first circle, it's the center-to-center distance; for others, it increases accordingly
    const radius = circleIndex === 0
      ? centerToCenterDistance
      : centerToCenterDistance + (circleIndex - 1) * (itemDiameter + gap * Math.sqrt(3));

    // Angle for the current item
    const angleIncrement = (2 * Math.PI) / itemsOnCurrentCircle; // Consistent angle increment
    const angle = angleIncrement * (index - totalItemsOnPreviousCircles);

    // Calculate the position
    const x = CENTER.x + radius * Math.cos(angle) - itemRadius;
    const y = CENTER.y + radius * Math.sin(angle) - itemRadius;

    return { x, y };
  };

  // Constants
  const itemDiameter = 20; // The diameter of the item
  const gap = 1; // The gap between items and between rings

  const calculatePosition = (index: number) => {
    if (index === 0) {
      return { x: CENTER.x - 15, y: CENTER.y - 15 }; // Center item
    }

    let circleIndex = 1;
    let itemsInPreviousCircles = 1; // Start with 1 item in the center
    let itemsOnThisCircle = 6; // Start with 6 items in the first circle

    // Find the current circle index based on the index of the item
    while (index >= itemsInPreviousCircles + itemsOnThisCircle) {
      itemsInPreviousCircles += itemsOnThisCircle;
      circleIndex++;
      itemsOnThisCircle = circleIndex * 6; // Increase by 6 for each new circle
    }

    // Calculate the angle for the item on its circle
    const angleIncrement = (2 * Math.PI) / itemsOnThisCircle;
    const angle = angleIncrement * (index - itemsInPreviousCircles);

    // Adjust radius for each circle
    const radius = 50 * circleIndex;
    const x = CENTER.x + radius * Math.cos(angle) - 15; // Adjust for item size
    const y = CENTER.y + radius * Math.sin(angle) - 15; // Adjust for item size

    return { x, y };
  };


  const renderCircleItems = () => {
    return people.map((_, index) => {
      const position = calculatePosition(index);
      if (!position) {
        return null;
      }
      return (
        <CircleItem
          key={index}
          style={{
            left: position.x,
            top: position.y,
          }}
        />
      );
    });
  };

  function onShareProfile() {
    router.push('/share_profile')
  }

  return (
    <>
      <ScrollView flex={1} showsVerticalScrollIndicator={false} >
        {/* <View flex={1} w="100%" justifyContent='center' alignItems='center' bg="red" borderRadius='100%'>
        {renderCircleItems()}
      </View> */}
        <View marginBottom={20} zIndex={2} w="100%" flexWrap='wrap' justifyContent='space-evenly' flexDirection='row'>
          {people.map((person, index) => {
            return (
              <Avatar circular size={60} my={10} mx={4} onPress={() => {
                console.log('pressed')
                router.push('/add/johndoe1')
              }}
              >
                <Avatar.Image src={person?.avatar_url || undefined} />
                <Avatar.Fallback bc="$background" />
              </Avatar>

              // <View key={index}
              //   w={60}
              //   h={60}
              //   br={100}
              //   bg="$background"
              //   my={10}
              //   mx={4}
              //   circular
              // >
              // </View>
            )
          })}
        </View>
      </ScrollView>
      <View position='absolute' alignItems='center' justifyContent='center' bottom={20} right={0} w="100%">
        {/* <TouchableOpacity onPress={addPerson} style={styles.addButton}>
          <View style={styles.addButtonText} />
        </TouchableOpacity> */}
        <XStack space="$5">
          <Button
            circular
            themeInverse
            size="$7"
            scaleIcon={1.4}
            icon={<Scan />}
          />
          <Button
            circular
            themeInverse
            size="$7"
            scaleIcon={1.4}
            icon={<User />}
            onPress={onShareProfile}
          />
        </XStack>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // Assuming a dark theme like in the image
  },
  circleItem: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#171717',
    position: 'absolute',
  },
  friendItem: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#171717',
  },
  addButton: {
    position: 'absolute',
    bottom: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: 'white',
  },
  addButtonText: {
    fontSize: 24,
    color: 'black',
  },
});

export default CirclesView;
