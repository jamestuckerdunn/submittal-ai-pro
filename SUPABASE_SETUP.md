# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project details:
   - **Name**: `submittal-ai-pro`
   - **Database Password**: Create a strong password
   - **Region**: Choose your preferred region
4. Wait for the project to be created (~2 minutes)

## 2. Configure Authentication

1. Go to **Authentication > Settings** in your Supabase dashboard
2. **Site URL**: Set to your production URL (e.g., `https://your-domain.vercel.app`)
3. **Redirect URLs**: Add both:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`
4. **Email Templates**:
   - Go to **Auth > Email Templates**
   - Select "Confirm Signup" template
   - Replace `{{ .ConfirmationURL }}` with `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

## 3. Set up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase/schema.sql` file
3. Click **Run** to execute the SQL
4. Verify tables were created by going to **Table Editor**

You should see these tables:

- `documents`
- `reviews`
- `subscriptions`

## 4. Configure Storage

1. Go to **Storage** in your Supabase dashboard
2. The `documents` bucket should already be created by the schema
3. Verify the bucket exists and has proper RLS policies

## 5. Get API Keys

1. Go to **Settings > API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 6. Update Environment Variables

### Local Development (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### Vercel Production

1. Go to your Vercel project dashboard
2. Go to **Settings > Environment Variables**
3. Add the same variables as above but with production URL:
   ```
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

## 7. Test Connection

1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/api/test-db`
3. You should see a success response with database connection status

## 8. Verify Setup

✅ **Database Tables**: All three tables (documents, reviews, subscriptions) exist
✅ **RLS Policies**: All tables have proper Row Level Security enabled
✅ **Storage Bucket**: Documents bucket exists with correct policies
✅ **Auth Configuration**: Email templates and redirect URLs are set
✅ **API Connection**: Test endpoint returns success
✅ **Environment Variables**: All keys are properly configured

## Troubleshooting

### Connection Issues

- Verify your project URL and API keys are correct
- Check that your IP is not blocked (if using database directly)
- Ensure RLS policies are properly configured

### Authentication Issues

- Verify Site URL and Redirect URLs are correctly set
- Check email template configuration
- Ensure auth is enabled in Supabase dashboard

### Storage Issues

- Verify the documents bucket exists
- Check RLS policies on storage.objects
- Ensure proper bucket permissions are set

## Next Steps

Once Supabase is configured, you can proceed to:

1. **Prompt 4**: Authentication System Implementation
2. **Prompt 5**: UI Foundation & Layout
3. Continue with the remaining prompts in sequence
