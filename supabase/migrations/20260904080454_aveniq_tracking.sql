-- AVENIQ only. Existing public.launch_signups and its grants are untouched.
create table public.aveniq_channels (
 id uuid primary key default gen_random_uuid(), code text not null unique check(code ~ '^[a-z0-9._-]{1,40}$'),
 name text not null check(length(name) between 1 and 80), source text not null check(source ~ '^[a-z0-9._-]{1,80}$'),
 medium text not null check(medium ~ '^[a-z0-9._-]{1,80}$'),
 content_mode text not null default 'none' check(content_mode in ('none','serial','date','free')),
 content_prefix text not null default '', note text not null default '', sort integer not null default 0,
 active boolean not null default true, created_at timestamptz not null default now()
);
create table public.aveniq_links (
 id uuid primary key default gen_random_uuid(), channel_id uuid references public.aveniq_channels(id),
 landing_path text not null check(landing_path='/'), source text not null, medium text not null, campaign text not null,
 content text not null default '', term text not null default '', url text not null,
 short_code text not null unique check(short_code ~ '^[a-z0-9._-]{1,64}$'),
 label text not null default '', created_by text not null default '', clicks bigint not null default 0,
 last_clicked_at timestamptz, archived boolean not null default false, created_at timestamptz not null default now(),
 unique(landing_path,source,medium,campaign,content,term),
 check(source ~ '^[a-z0-9._-]{1,80}$' and medium ~ '^[a-z0-9._-]{1,80}$' and campaign ~ '^[a-z0-9._-]{1,80}$'),
 check(content ~ '^[a-z0-9._-]{0,80}$' and term ~ '^[a-z0-9._-]{0,80}$')
);
create index aveniq_links_channel_idx on public.aveniq_links(channel_id);
create table public.aveniq_clicks (
 id bigint generated always as identity primary key, link_id uuid not null references public.aveniq_links(id),
 clicked_at timestamptz not null default now(), device text not null check(device in ('mobile','desktop','other')),
 referer_host text not null default '', is_bot boolean not null default false check(is_bot=false)
);
create index aveniq_clicks_time_idx on public.aveniq_clicks(clicked_at,link_id);
create index aveniq_clicks_link_idx on public.aveniq_clicks(link_id);
create table public.aveniq_signups (
 id uuid primary key default gen_random_uuid(), phone text not null check(phone ~ '^010[0-9]{8}$'), email text,
 privacy_agreed_at timestamptz not null, privacy_consent_version text not null,
 marketing_consent boolean not null, marketing_consent_at timestamptz, marketing_consent_channels text[] not null,
 marketing_consent_version text, source text not null, created_at timestamptz not null default now(),
 landing_path text not null default '/', utm_source text not null default '', utm_medium text not null default '',
 utm_campaign text not null default '', utm_content text not null default '', utm_term text not null default ''
);
create index aveniq_signups_attribution_idx on public.aveniq_signups(landing_path,utm_source,utm_medium,utm_campaign,utm_content,utm_term,created_at);
alter table public.aveniq_channels enable row level security;
alter table public.aveniq_links enable row level security;
alter table public.aveniq_clicks enable row level security;
alter table public.aveniq_signups enable row level security;
revoke all on public.aveniq_channels,public.aveniq_links,public.aveniq_clicks,public.aveniq_signups from anon,authenticated;
grant select,insert,update on public.aveniq_channels,public.aveniq_links to service_role;
grant select,insert on public.aveniq_clicks,public.aveniq_signups to service_role;
grant usage,select on sequence public.aveniq_clicks_id_seq to service_role;

create function public.aveniq_record_click(p_code text,p_device text,p_referer text)
returns void language plpgsql security invoker set search_path='' as $$
declare v_id uuid;
begin
 update public.aveniq_links set clicks=clicks+1,last_clicked_at=now() where short_code=p_code returning id into v_id;
 if v_id is not null then
  insert into public.aveniq_clicks(link_id,device,referer_host) values(v_id,p_device,left(p_referer,253));
 end if;
end $$;
revoke all on function public.aveniq_record_click(text,text,text) from public,anon,authenticated;
grant execute on function public.aveniq_record_click(text,text,text) to service_role;

-- Summaries only; no applicant contact fields are returned.
create function public.aveniq_link_metrics(p_from timestamptz default null,p_to timestamptz default null)
returns table(link_id uuid,clicks bigint,conversions bigint)
language sql stable security invoker set search_path='' as $$
 select l.id,
 (select count(*) from public.aveniq_clicks c where c.link_id=l.id and (p_from is null or c.clicked_at>=p_from) and (p_to is null or c.clicked_at<p_to)),
 (select count(*) from public.aveniq_signups s where
 s.landing_path=l.landing_path and s.utm_source=l.source and s.utm_medium=l.medium and s.utm_campaign=l.campaign
 and s.utm_content=l.content and s.utm_term=l.term and (p_from is null or s.created_at>=p_from) and (p_to is null or s.created_at<p_to))
 from public.aveniq_links l;
$$;
create function public.aveniq_daily_metrics(p_from timestamptz default null,p_to timestamptz default null)
returns table(day text,clicks bigint,conversions bigint)
language sql stable security invoker set search_path='' as $$
 with e as (
 select (c.clicked_at at time zone 'Asia/Seoul')::date d,1::bigint c,0::bigint s from public.aveniq_clicks c
 where (p_from is null or c.clicked_at>=p_from) and (p_to is null or c.clicked_at<p_to)
 union all
 select (s.created_at at time zone 'Asia/Seoul')::date,0::bigint,1::bigint from public.aveniq_signups s
 join public.aveniq_links l on (s.landing_path,s.utm_source,s.utm_medium,s.utm_campaign,s.utm_content,s.utm_term)
 =(l.landing_path,l.source,l.medium,l.campaign,l.content,l.term)
 where (p_from is null or s.created_at>=p_from) and (p_to is null or s.created_at<p_to))
 select d::text,sum(c)::bigint,sum(s)::bigint from e group by d order by d;
$$;
revoke all on function public.aveniq_link_metrics(timestamptz,timestamptz),public.aveniq_daily_metrics(timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.aveniq_link_metrics(timestamptz,timestamptz),public.aveniq_daily_metrics(timestamptz,timestamptz) to service_role;
