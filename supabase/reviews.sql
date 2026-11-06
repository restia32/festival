create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null default 'Visitor'
    check (char_length(name) between 1 and 40)
    check (name !~ '^[=+@[:cntrl:]]'),
  rating smallint not null
    check (rating between 1 and 5),
  comment text not null
    check (char_length(comment) between 5 and 500)
    check (comment !~ '^[=+@[:cntrl:]]')
);

alter table public.reviews enable row level security;

create index if not exists reviews_created_at_idx
  on public.reviews (created_at desc, id desc);

revoke all on table public.reviews from public, anon, authenticated;
grant insert on table public.reviews to anon;

drop policy if exists "Anyone can submit a valid review" on public.reviews;
create policy "Anyone can submit a valid review"
  on public.reviews
  for insert
  to anon
  with check (
    char_length(name) between 1 and 40
    and char_length(comment) between 5 and 500
    and rating between 1 and 5
    and name !~ '^[=+@[:cntrl:]]'
    and comment !~ '^[=+@[:cntrl:]]'
  );

create or replace function public.get_public_reviews()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with summary as (
    select
      count(*)::integer as total_reviews,
      coalesce(round(avg(rating)::numeric, 1), 0) as average_rating
    from public.reviews
  ),
  recent_reviews as (
    select id, created_at, name, rating, comment
    from public.reviews
    order by created_at desc, id desc
    limit 50
  )
  select jsonb_build_object(
    'total_reviews', summary.total_reviews,
    'average_rating', summary.average_rating,
    'reviews', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', recent_reviews.id,
            'created_at', recent_reviews.created_at,
            'name', recent_reviews.name,
            'rating', recent_reviews.rating,
            'comment', recent_reviews.comment
          )
          order by recent_reviews.created_at desc, recent_reviews.id desc
        )
        from recent_reviews
      ),
      '[]'::jsonb
    )
  )
  from summary;
$$;

revoke all on function public.get_public_reviews() from public, anon, authenticated;
grant execute on function public.get_public_reviews() to anon;
