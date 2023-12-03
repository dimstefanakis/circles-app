import { useState, useEffect } from "react";
import { Session } from '@supabase/supabase-js'
import { supabase } from "../utils/supabase";
import { useRouter } from "expo-router";

function useUser() {
  const router = useRouter();
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  const getUserDetails = (user_id: any) =>
    supabase.from('users').select('*').eq('id', user_id).single();

  const getCircle = (user_id: any) =>
    supabase.from('circles').select('*').eq('user_id', user_id).single();

  const getCircleMembers = (circle_id: any) =>
    supabase.from('circle_members').select(`
      *,
      user:user_id (
        *
      )
    `).eq('circle_id', circle_id)

  async function getUser() {
    const session = await supabase.auth.getSession();
    // const user = await supabase.auth.getUser();
    const userDetail = await getUserDetails(session?.data.session?.user?.id);
    const circleData = await getCircle(session?.data.session?.user?.id);
    const circleMembers = await getCircleMembers(circleData?.data?.id);
    const circle = {
      id: circleData?.data?.id,
      members: circleMembers?.data?.map((member: any) => member.user),
    }

    setUser(session?.data.session?.user ? { ...session.data.session.user, ...userDetail.data, circle: circle } : null);
    setSession(session?.data.session ?? null);
    setLoading(false);
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const userDetail = await getUserDetails(session?.user.id);
        const circleData = await getCircle(session?.user?.id);
        const circleMembers = await getCircleMembers(circleData?.data?.id);
        const circle = {
          id: circleData?.data?.id,
          members: circleMembers?.data?.map((member: any) => member.user),
        }

        setUser(session?.user ? { ...session.user, ...userDetail.data, circle: circle } : null);
        setSession(session ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);


  return { user, session, loading };
}

export default useUser;
