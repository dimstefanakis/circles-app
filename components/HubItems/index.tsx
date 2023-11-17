import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { XStack, YStack, Text, View, Button } from 'tamagui';
import { Map } from '@tamagui/lucide-icons'
import { getMyCircle } from '../../utils/supabase';
import useUser from '../../hooks/useUser';

function HubItems() {
  const router = useRouter();
  const { user, session } = useUser();

  function onClickMap() {
    router.push('/friend_map')
  }

  useEffect(() => {
    if (user) {
      getMyCircle(user.id)
    }
  }, [user])

  return (
    <YStack space='$4' marginTop="$4">
      <XStack space='$2'>
        <YStack space='$1' justifyContent='center' alignItems='center'>
          <Button height="$6" w="$6" icon={<Map size='$2' />} onPress={onClickMap}>
          </Button>
          <Text
            marginTop="$2"
            fontSize="$4"
            fontWeight="bold"
          >Map</Text>
        </YStack>
      </XStack>
    </YStack>
  )
}

export default HubItems;