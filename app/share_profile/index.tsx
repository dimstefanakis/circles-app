import { YStack, Text, Spinner, Avatar, Input, Button } from 'tamagui';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import useUser from '../../hooks/useUser';

function AddFriendScreen() {
  const { user, session } = useUser()

  return (
    <YStack flex={1} space="$5" padding="$5" justifyContent='center' alignItems='center'>
      <YStack space="$5">
        <Avatar circular size="$40">
          <Avatar.Image src={user?.avatar_url} />
          <Avatar.Fallback bc="gray" />
        </Avatar>
        <Text fontSize="$5" fontWeight="bold">{user?.username}</Text>
        <Button>
          <Spinner />
        </Button>
      </YStack>
    </YStack>
  );
}

export default AddFriendScreen;
