-- 1. profiles 表：存每個使用者的 role（註冊時由 trigger 寫入）
create table if not exists public.profiles (
  user_id uuid not null primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin'))
);

-- 2. 新用戶註冊時自動寫入 profiles，預設 role = 'user'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. RLS：登入用戶只能讀自己的 profile
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);


-- 既有用戶補寫 profiles（跑過一次即可）
-- insert into public.profiles (user_id, role) select id, 'user' from auth.users on conflict (user_id) do nothing;
