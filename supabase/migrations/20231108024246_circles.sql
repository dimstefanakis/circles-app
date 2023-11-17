create table "public"."circle_members" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "circle_id" uuid not null
);


alter table "public"."circle_members" enable row level security;

create table "public"."circles" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "user_id" uuid
);


alter table "public"."circles" enable row level security;

CREATE UNIQUE INDEX circle_members_pkey ON public.circle_members USING btree (id);

CREATE UNIQUE INDEX circle_members_user_id_circle_id_key ON public.circle_members USING btree (user_id, circle_id);

CREATE UNIQUE INDEX circles_pkey ON public.circles USING btree (id);

alter table "public"."circle_members" add constraint "circle_members_pkey" PRIMARY KEY using index "circle_members_pkey";

alter table "public"."circles" add constraint "circles_pkey" PRIMARY KEY using index "circles_pkey";

alter table "public"."circle_members" add constraint "circle_members_circle_id_fkey" FOREIGN KEY (circle_id) REFERENCES circles(id) not valid;

alter table "public"."circle_members" validate constraint "circle_members_circle_id_fkey";

alter table "public"."circle_members" add constraint "circle_members_user_id_circle_id_key" UNIQUE using index "circle_members_user_id_circle_id_key";

alter table "public"."circle_members" add constraint "circle_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."circle_members" validate constraint "circle_members_user_id_fkey";

alter table "public"."circles" add constraint "circles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."circles" validate constraint "circles_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_friend_limit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF (SELECT COUNT(*) FROM circle_members WHERE id = NEW.id) >= 150 THEN
        RAISE EXCEPTION 'Friend limit reached for this circle';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE TRIGGER check_limit_before_insert BEFORE INSERT ON public.circle_members FOR EACH ROW WHEN ((new.id IS NOT NULL)) EXECUTE FUNCTION check_friend_limit();


