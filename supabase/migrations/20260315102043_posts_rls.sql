-- posts RLS：一般用戶只能讀 published=true，admin 可讀全部

alter table public.posts enable row level security;

-- 公開：所有人可讀已發佈文章（anon + authenticated）
create policy "Public can read published posts"
  on public.posts for select
  using (published = true);

-- admin：可讀全部（含 draft）
create policy "Admins can read all posts"
  on public.posts for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- admin：可 insert/update/delete
create policy "Admins can manage posts"
  on public.posts for all
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );
