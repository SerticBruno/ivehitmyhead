# 🚀 Quick Setup Checklist

## 1. Supabase Setup (5 minutes)
- [ ] Go to [supabase.com](https://supabase.com) and create account
- [ ] Create new project
- [ ] Go to SQL Editor → paste and run `supabase-schema.sql`
- [ ] Copy Project URL and API keys from Settings → API

## 2. Cloudinary Setup (3 minutes)
- [ ] Go to [cloudinary.com](https://cloudinary.com) and create account
- [ ] Copy Cloud Name, API Key, and API Secret from dashboard

## 3. Environment Variables (2 minutes)
- [ ] Copy `env.example` to `.env.local`
- [ ] Fill in your actual values from Supabase and Cloudinary

## 4. Test the System
- [ ] Run `npm run dev`
- [ ] Go to `/test` to verify connections
- [ ] Go to `/upload` to test meme upload

## 🔑 Required Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📁 What Gets Created Automatically
- ✅ Database tables (users, memes, categories, likes, comments, views)
- ✅ Security policies (RLS)
- ✅ Indexes for performance
- ✅ Default categories
- ✅ API endpoints for all operations

## 🧪 Test Pages
- `/test` - Verify Supabase and Cloudinary connections
- `/upload` - Test meme upload functionality
- `/memes` - View uploaded memes

**Total setup time: ~10 minutes**
