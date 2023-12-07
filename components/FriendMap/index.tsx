import MapView from 'react-native-maps';
import { Button, Input, YStack, XStack } from 'tamagui';
import { ChevronDown } from '@tamagui/lucide-icons';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

function FriendMap() {
  const router = useRouter();
  return (
    <YStack flex={1}>
      <XStack
        position='absolute'
        top={20}
        zIndex={1}
        px={10}
        w={width}
        justifyContent='space-between'
      >
        <Input placeholder='Search' w={width - 80 }/>
        <Button
          circular
          mx={2}
          icon={<ChevronDown size='$2' />}
          onPress={() => {
            router.push('/')
          }}
        ></Button>

      </XStack>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      />
    </YStack>
  );
}

export default FriendMap;