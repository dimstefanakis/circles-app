create table "public"."posts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone,
    "post_type" text,
    "user_id" uuid
);


alter table "public"."posts" enable row level security;

create table "public"."text_posts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "post_id" uuid,
    "title" text,
    "content" text
);


alter table "public"."text_posts" enable row level security;

create table "public"."users" (
    "id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "full_name" text,
    "username" text,
    "avatar_url" text,
    "email" text
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$function$
;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

CREATE UNIQUE INDEX text_posts_pkey ON public.text_posts USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."text_posts" add constraint "text_posts_pkey" PRIMARY KEY using index "text_posts_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."posts" add constraint "posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."posts" validate constraint "posts_user_id_fkey";

alter table "public"."text_posts" add constraint "text_posts_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."text_posts" validate constraint "text_posts_post_id_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_username_key" UNIQUE using index "users_username_key";

create policy "Enable full access for post user"
on "public"."posts"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Enable read access for all users"
on "public"."posts"
as permissive
for select
to public
using (true);


create policy "Enable full access to post user"
on "public"."text_posts"
as permissive
for all
to public
using ((id IN ( SELECT text_posts.post_id
   FROM posts
  WHERE (posts.user_id = auth.uid()))));


create policy "Enable read access for all users"
on "public"."text_posts"
as permissive
for select
to public
using (true);


create policy "Enable full access to owner"
on "public"."users"
as permissive
for all
to public
using ((auth.uid() = id));


create policy "Enable read access for all users"
on "public"."users"
as permissive
for select
to public
using (true);



