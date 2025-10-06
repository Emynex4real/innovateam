-- Activity Logs Table
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Soft Delete columns for users and transactions
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='users' and column_name='deleted_at') then
    alter table users add column deleted_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='transactions' and column_name='deleted_at') then
    alter table transactions add column deleted_at timestamptz;
  end if;
end$$;
