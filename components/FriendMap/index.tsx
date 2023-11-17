import MapView from 'react-native-maps';
import { Button } from 'tamagui';
import { ChevronDown } from '@tamagui/lucide-icons';
import { YStack } from 'tamagui';
import { useRouter } from 'expo-router';

function FriendMap() {
  const router = useRouter();
  return (
    <YStack flex={1}>
      <Button
        position='absolute'
        top={20}
        right={20}
        zIndex={1}
        circular
        icon={<ChevronDown size='$2' />}
        onPress={() => {
          router.push('/')
        }}
      ></Button>
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