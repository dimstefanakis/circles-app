create policy "Enable insert for users based on user_id"
on "public"."circle_members"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Read access to everyone"
on "public"."circle_members"
as permissive
for select
to authenticated
using (true);


create policy "Enable all access to owner"
on "public"."circles"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Enable read for users based on user_id"
on "public"."circles"
as permissive
for select
to public
using ((auth.uid() = user_id));



