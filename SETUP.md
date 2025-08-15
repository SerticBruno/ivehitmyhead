# Meme Platform Setup Guide

This guide will help you set up the meme platform with Supabase for the database and Cloudinary for image storage.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account
- A Cloudinary account
- Your Next.js app ready for deployment on Vercel

## Step 1: Set up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

### 1.2 Get Your Supabase Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

### 1.3 Set up the Database

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. This will create all necessary tables, indexes, and policies

## Step 2: Set up Cloudinary

### 2.1 Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up
2. Verify your email address

### 2.2 Get Your Cloudinary Credentials

1. Go to your Dashboard
2. Copy the following values:
   - Cloud name
   - API Key
   - API Secret

## Step 3: Configure Environment Variables

### 3.1 Local Development

1. Copy `env.example` to `.env.local`
2. Fill in your actual values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all the environment variables from above
4. Make sure to add them to all environments (Production, Preview, Development)

## Step 4: Test the Setup

### 4.1 Start the Development Server

```bash
npm run dev
```

### 4.2 Test Image Upload

1. Navigate to your app
2. Try uploading a meme using the upload component
3. Check that the image appears in Cloudinary
4. Verify the meme data is stored in Supabase

## Step 5: Deploy to Vercel

### 5.1 Push to GitHub

```bash
git add .
git commit -m "Add meme platform with Supabase and Cloudinary"
git push origin main
```

### 5.2 Deploy on Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect it's a Next.js app
3. The build should complete successfully with your environment variables

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Errors
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure the database schema was created successfully

#### 2. Cloudinary Upload Failures
- Verify your Cloudinary credentials
- Check that your account has sufficient storage/bandwidth
- Ensure the image file is valid and under 10MB

#### 3. Build Errors on Vercel
- Verify all environment variables are set in Vercel
- Check that the build command is `npm run build`
- Ensure all dependencies are in `package.json`

### Database Issues

If you need to reset your database:

1. Go to Supabase Dashboard → SQL Editor
2. Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Re-run the schema script

## Security Considerations

### 1. Row Level Security (RLS)
- All tables have RLS enabled
- Policies are configured to allow appropriate access
- Users can only modify their own content

### 2. API Keys
- Never commit `.env.local` to version control
- Use environment variables in production
- Rotate API keys regularly

### 3. File Uploads
- Images are validated on both client and server
- File size is limited to 10MB
- Only image files are accepted

## Next Steps

### 1. Authentication
- Implement Supabase Auth for user management
- Add login/signup pages
- Protect upload and interaction endpoints

### 2. Advanced Features
- Add search functionality
- Implement trending algorithms
- Add user profiles and following

### 3. Performance
- Add image optimization
- Implement caching strategies
- Add CDN for global performance

## Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review [Cloudinary documentation](https://cloudinary.com/documentation)
3. Check the [Next.js documentation](https://nextjs.org/docs)
4. Review the error logs in your browser console and server logs

## Cost Estimation

### Supabase (Free Tier)
- 500MB database
- 2GB bandwidth
- 50,000 monthly active users
- **Cost: $0/month**

### Cloudinary (Free Tier)
- 25GB storage
- 25GB bandwidth
- **Cost: $0/month**

### Vercel (Free Tier)
- 100GB bandwidth
- 100GB storage
- **Cost: $0/month**

**Total estimated cost for small-medium scale: $0-25/month**
