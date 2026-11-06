# Supabase visitor reviews

The review feature uses Supabase directly from the browser. The project URL and publishable (or legacy `anon`) key are public client credentials, not secrets; database permissions are enforced by row-level security in [`reviews.sql`](./reviews.sql). Never put a `service_role` or secret key in this website.

## Configure the database

1. Create a Supabase project.
2. In the Supabase dashboard, open **SQL Editor**, paste the contents of [`reviews.sql`](./reviews.sql), and run it.
3. In **Project Settings → API**, copy the **Project URL** and the **publishable key** (or legacy `anon` key).

The SQL creates the reviews table, restricts anonymous visitors to inserting valid reviews, and exposes a public function that returns the overall rating plus the latest 50 reviews. The table itself does not allow anonymous reads; the function only exposes the intended public review fields.

## Configure local development

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the values from your project.
3. Restart the Vite development server after editing `.env.local`.

## Deploy on Vercel

In the Vercel project, open **Settings → Environment Variables** and add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Apply them to Production (and Preview if desired), then redeploy. Vite embeds these `VITE_` values into the public client bundle; they must never contain a Supabase secret or `service_role` key.

Visitor names and comments are public. The form does not collect email addresses. Review storage is subject to Supabase project quotas, and public insert policies can attract spam; review submissions should be monitored and moderated as the site grows.
