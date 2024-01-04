import { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Button, Input, YStack, XStack } from 'tamagui';
import { ChevronDown } from '@tamagui/lucide-icons';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useDebounce } from 'usehooks-ts'
import { supabase } from '../../utils/supabase';
import useUser from '../../hooks/useUser';
import * as Location from 'expo-location';


const { width, height } = Dimensions.get('window');

const debounceDelay = 500; // delay in ms

function FriendMap() {
  const router = useRouter();
  const { user, session, loading } = useUser()
  const [location, setLocation] = useState<Location.LocationObject>();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const debouncedSearch = useDebounce<string>(search, debounceDelay)
  const [errorMsg, setErrorMsg] = useState<string>();

  async function onSearch(query: string) {
    const response = await fetch(`${process.env.API_URL}/api/location-results`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        query: query,
        ll: `${location?.coords.latitude},${location?.coords.longitude}`
      }),
      headers: {
        'access_token': session?.access_token as string,
        'refresh_token': session?.refresh_token as string,
      }
    })
    const data = await response.json()
    console.log(data, session?.user)
    // setResults(data);
  }

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch])

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
        <Input placeholder='Search' w={width - 80} onChangeText={(text) => {
          console.log(text)
          setSearch(text)
        }} />
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
        showsUserLocation
        followsUserLocation
        style={{ flex: 1 }}
        region={{
          latitude: location?.coords.latitude || 37.78825,
          longitude: location?.coords.longitude || -122.4324,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        initialRegion={{
          latitude: location?.coords.latitude || 37.78825,
          longitude: location?.coords.longitude || -122.4324,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {results.map((result: any) => {
          return (
            <Marker
              key={result.place.fsq_id}
              coordinate={{
                latitude: result.place.geo.center.latitude,
                longitude: result.place.geo.center.longitude,
              }}
              title={result.place.name}
              description={result.place.address}
            />
          )
        }
        )}
      </MapView>
    </YStack>
  );
}

export default FriendMap;