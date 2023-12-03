import { Avatar, YStack, XStack, Text } from 'tamagui'
import type { Database } from "../../types_db";

export type PostType =
  Database['public']['Tables']['posts']['Row'] & {
    text_posts: Database['public']['Tables']['text_posts']['Row'][]
  } & {
    user: {
      username: string
      avatar_url: string
      full_name: string
    }
  }


export type PostProps = {
  post: PostType
}

function Post({ post }: PostProps) {
  return (
    <YStack space='$4'>
      <XStack space='$2'>
        <Avatar circular size="$3">
          <Avatar.Image src={post.user.avatar_url} />
          <Avatar.Fallback bc="gray" />
        </Avatar>
        <YStack space='$1' justifyContent='center'>
          <Text
            fontSize="$4"
            marginLeft="$1"
            fontWeight="bold"
          >{post.user.username}</Text>
          {/* <Text color='gray'>{post.created_at}</Text> */}
        </YStack>
      </XStack>
      <Text>{post.text_posts[0].content}</Text>
    </YStack>
  )
}

export default Post
