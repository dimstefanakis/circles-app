import { useState, useEffect } from "react";
import { Session } from '@supabase/supabase-js'
import { Alert } from "react-native";
import { Twitter } from "@tamagui/lucide-icons";
import { Text, Button, YStack, Input, Spinner } from "tamagui";
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { useRouter, Redirect } from "expo-router";
import useUser from "../hooks/useUser";
import { supabase } from "../utils/supabase";

type Inputs = {
  password: string
  email: string
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<Inputs>()
  const { user, session } = useUser()

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    console.log(session, error)
    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    // const userData = await supabase.auth.getUser()
    // await supabase.from('users').insert([
    //   {
    //     id: userData.data.user?.id,
    //     username: data.username,
    //     email: data.email,
    //   },
    // ])
    setLoading(false)
  }

  useEffect(() => {
    if (session && session.access_token) router.replace("/")
  }, [session])

  // if (session) return <Redirect href="/" />

  return (
    <YStack paddingTop={100} flex={1} space='$4'>
      {/* <Text>Login</Text> */}
      <YStack alignItems="center" marginBottom={30}>
        <Twitter size={100} />
      </YStack>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            textContentType='emailAddress'
            autoCapitalize='none'
            autoCorrect={false}
          />
        )}
        name="email"
      />
      {/* <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Username"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            textContentType='username'
            autoCapitalize='none'
            autoCorrect={false}
          />
        )}
        name="username"
      /> */}
      {/* {errors.username && <Text>Username is required.</Text>} */}
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            textContentType='password'
            secureTextEntry
          />
        )}
        name="password"
      />
      {errors.password && <Text>This is required.</Text>}
      <Button onPress={handleSubmit(onSubmit)}>
        {loading ? <Spinner /> : 'Login'}
      </Button>
      <Button onPress={() => router.push("/signup")} variant='outlined'>Sign up</Button>
    </YStack>
  );
}
