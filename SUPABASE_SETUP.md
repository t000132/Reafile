# Supabase Setup Guide for Reafile

## ✅ What's Been Implemented

All the code for Supabase authentication has been set up:

- ✅ Supabase client libraries installed
- ✅ Client and server-side Supabase configuration
- ✅ Auth provider with React context
- ✅ Login/Signup modals with email/password and OAuth
- ✅ Header updated with auth state (shows user menu when logged in)
- ✅ Auth callback route for OAuth redirects
- ✅ Custom scrollbar styling added

## 🚀 Next Steps

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the details:
   - **Name**: Reawon Ecosystem (or any name)
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start

### 2. Get Your Supabase Credentials

1. Once your project is created, go to **Project Settings** (gear icon)
2. Click on **API** in the left sidebar
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 3. Configure Environment Variables

1. Create a `.env.local` file in your project root:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Replace the values with your actual credentials from step 2

### 4. Configure Authentication Providers

#### For Email/Password (Already Enabled)
This works out of the box!

#### For OAuth Providers (Google/GitHub)

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable the providers you want:

**For Google:**
- Enable Google provider
- Add your Google OAuth credentials
- Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

**For GitHub:**
- Enable GitHub provider
- Add your GitHub OAuth credentials
- Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 5. Configure Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain (e.g., `https://reafile.com`)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://reafile.com/auth/callback` (for production)
   - Add similar URLs for your other apps:
     - `https://polywon.com/auth/callback`
     - `https://reawon.com/auth/callback`

### 6. Test the Authentication

1. Start your dev server: `npm run dev`
2. Click "Sign up" in the header
3. Create an account with email/password or OAuth
4. You should see your email's first letter in a circular avatar when logged in

## 🔐 Multi-App Setup

To use the same Supabase instance across all your apps (Reafile, Polywon, Reawon):

1. Use the **same** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in all apps
2. Add all app domains to the redirect URLs (as shown in step 5)
3. Configure CORS if needed in Supabase settings

### Shared User Data

All apps will share the same user authentication. To implement premium features:

1. Create a database table for subscriptions:
```sql
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  plan text not null, -- 'free', 'premium', etc.
  status text not null, -- 'active', 'cancelled', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Policy: Users can read their own subscription
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
```

2. Query this table from any app to check premium status
3. Each app can read the same subscription data

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js with Supabase Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security (RLS) Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🎉 You're All Set!

Once you've completed these steps, your authentication system will be fully functional across all your Reawon ecosystem apps!
