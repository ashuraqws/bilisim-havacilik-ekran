-- Supabase SQL Editor'da bir kez çalıştırın. Tekrar çalıştırmak güvenlidir.

-- 1) Tek yönetici: Authentication > Users'taki kullanıcının UUID'si (SQL'de e-posta yok)
create table if not exists public.admin_user (
  id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admin_user enable row level security; -- politika yok: yalnız security definer fonksiyon okur

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_user where id = auth.uid());
$$;

-- Eski e-posta tabanlı yapıyı kaldır (ilk kurulumda no-op)
drop policy if exists allowed_users_all on public.allowed_users;
drop trigger if exists allowed_users_limit_ins on public.allowed_users;
drop trigger if exists allowed_users_limit_del on public.allowed_users;
drop function if exists public.limit_allowed_users();
drop table if exists public.allowed_users;
drop function if exists public.is_allowed();

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
-- created_by anon'a kapalı: yalnız kiosk'un okuduğu sütunlar açılır (admin = authenticated etkilenmez)
revoke select on public.videos from anon;
grant select (id, title, storage_path, start_date, end_date, daily_from, daily_to, weekdays, every_n, enabled) on public.videos to anon;
drop policy if exists videos_admin_all on public.videos;
create policy videos_admin_all on public.videos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 3) Depolama kovası (herkes okur, yazma yalnız yönetici)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists videos_obj_read on storage.objects;
-- Anon yalnız aktif (videos_public_read'den geçen) bir satırın dosyasını okur, kovayı LİSTELEYEMEZ; yönetici hepsini listeler.
-- Not: kova public olduğundan, yolu bilinen dosya /object/public/ ile yine indirilir; liste çıkarılamaz.
create policy videos_obj_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'videos' and (public.is_admin()
    or exists (select 1 from public.videos v where v.storage_path = storage.objects.name)));
drop policy if exists videos_obj_write on storage.objects;
create policy videos_obj_write on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and public.is_admin());
drop policy if exists videos_obj_update on storage.objects;
create policy videos_obj_update on storage.objects for update to authenticated
  using (bucket_id = 'videos' and public.is_admin());
drop policy if exists videos_obj_delete on storage.objects;
create policy videos_obj_delete on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and public.is_admin());

-- 4) Yönetici kaydı: Authentication > Users'taki yönetici kullanıcısının UUID'sini yazın, sonra çalıştırın:
-- insert into public.admin_user (id) values ('UUID_BURAYA') on conflict do nothing;
