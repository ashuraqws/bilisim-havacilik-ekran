-- Supabase SQL Editor'da bir kez çalıştırın. Tekrar çalıştırmak güvenlidir.

-- 1) Yetkili kişiler (en fazla 5)
create table if not exists public.allowed_users (
  email text primary key check (email = lower(email))
);
alter table public.allowed_users enable row level security;

create or replace function public.is_allowed() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.allowed_users where email = lower(auth.jwt() ->> 'email'));
$$;

create or replace function public.limit_allowed_users() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' and (select count(*) from public.allowed_users) >= 5 then
    raise exception 'En fazla 5 kişi';
  end if;
  if tg_op = 'DELETE' and (select count(*) from public.allowed_users) <= 1 then
    raise exception 'Son yetkili silinemez';
  end if;
  return coalesce(new, old);
end $$;
drop trigger if exists allowed_users_limit_ins on public.allowed_users;
create trigger allowed_users_limit_ins before insert on public.allowed_users
  for each row execute function public.limit_allowed_users();
drop trigger if exists allowed_users_limit_del on public.allowed_users;
create trigger allowed_users_limit_del before delete on public.allowed_users
  for each row execute function public.limit_allowed_users();

drop policy if exists allowed_users_all on public.allowed_users;
create policy allowed_users_all on public.allowed_users for all to authenticated
  using (public.is_allowed()) with check (public.is_allowed());

-- 2) Videolar
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  storage_path text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now(),
  created_by text,
  start_date date not null,
  end_date date not null,
  daily_from text not null default '08:50' check (daily_from ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  daily_to text not null default '16:10' check (daily_to ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  weekdays int[] not null default '{1,2,3,4,5,6,7}' check (weekdays <@ array[1,2,3,4,5,6,7]),
  every_n int not null default 10 check (every_n >= 1),
  enabled boolean not null default true,
  check (end_date >= start_date)
);
alter table public.videos enable row level security;

drop policy if exists videos_public_read on public.videos;
create policy videos_public_read on public.videos for select to anon, authenticated using (enabled and start_date <= (now() at time zone 'Europe/Istanbul')::date
         and end_date >= (now() at time zone 'Europe/Istanbul')::date - 1); -- -1: gece yarısını aşan pencerenin sabah kısmı
drop policy if exists videos_admin_all on public.videos;
create policy videos_admin_all on public.videos for all to authenticated
  using (public.is_allowed()) with check (public.is_allowed());

-- 3) Depolama kovası (herkes okur, yazma yalnız yetkililer)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists videos_obj_read on storage.objects;
create policy videos_obj_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'videos');
drop policy if exists videos_obj_write on storage.objects;
create policy videos_obj_write on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and public.is_allowed());
drop policy if exists videos_obj_update on storage.objects;
create policy videos_obj_update on storage.objects for update to authenticated
  using (bucket_id = 'videos' and public.is_allowed());
drop policy if exists videos_obj_delete on storage.objects;
create policy videos_obj_delete on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and public.is_allowed());

-- 4) İlk yetkili (kendi e-postanızı yazın, küçük harfle), sonra çalıştırın:
-- insert into public.allowed_users values ('E_POSTA_BURAYA');
