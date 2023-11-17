import { useEffect, useState } from 'react';
import { YStack, ScrollView, Text, Spinner, Avatar, Input, Switch, View, Button } from 'tamagui';
import { Phone, Map } from '@tamagui/lucide-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../utils/supabase';
import type { Database } from '../../../types_db';
import useUser from '../../../hooks/useUser';
import { MySafeAreaView } from '../../../components/MySafeAreaView';
import { useRouter } from 'expo-router';

type User = Database['public']['Tables']['users']['Row']

function AddFriendScreen() {
  const { user } = useUser()
  const [friend, setFriend] = useState<User>()
  const [loading, setLoading] = useState(false)
  const { username } = useLocalSearchParams<{ username: string }>();

  async function getUser() {
    if (!username) return;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()
    if (data) {
      setFriend(data)
    }
    if (error) console.log(error)
    console.log(data)
  }

  async function addFriend() {
    if (!friend) return;
    setLoading(true)
    const { data, error } = await supabase
      .from('circle_members')
      .insert([
        {
          user_id: user.id,
          circle_id: user.circle.id,
        },
      ])
    if (data) {
      console.log(data)
      router.replace('/')
    }
    if (error) console.log(error)
    setLoading(false)
  }

  useEffect(() => {
    getUser()
  }, [username])

  return (
    <MySafeAreaView>
      <ScrollView flex={1}>
        <YStack flex={1} space="$5" padding="$5" justifyContent='center' alignItems='center'>
          <YStack space="$5" w="100%" alignItems='center'>
            <Avatar circular size={250}>
              <Avatar.Image src={friend?.avatar_url || undefined} />
              <Avatar.Fallback bc="gray" />
            </Avatar>
            <Text fontSize="$12" textAlign="center" fontWeight="bold">{username}</Text>
            <YStack space="$2" my="$6" w="100%">
              <PermissionSwitch text="Share phone number" icon={<Phone />} />
              <PermissionSwitch text="Share location" icon={<Map />} />
            </YStack>
            <Button w="50%" size="$6" onPress={addFriend}>
              {loading ? <Spinner /> : 'Add Friend'}
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </MySafeAreaView>
  );
}

function PermissionSwitch({ text, icon }: { text: string, icon: React.ReactNode }) {
  const [checked, setChecked] = useState(false)

  return (
    <View onPress={() => {
      setChecked(!checked)
    }} flexDirection='row' p="$5" borderRadius="$2" w="100%" alignItems='center' justifyContent='space-between' bg="$background">
      <View flexDirection='row' alignItems='center' justifyContent='center'>
        {icon}
        <Text ml="$3" fontSize="$5" fontWeight="bold">{text}</Text>
      </View>
      <Switch size="$4" checked={checked} onPress={() => {
        setChecked(!checked)
      }}>
        <Switch.Thumb animation="bouncy" />
      </Switch>
    </View>
  )
}

export default AddFriendScreen;
