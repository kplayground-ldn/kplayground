# Deployment Checklist for K-Playground Community

Use this checklist to ensure everything is set up correctly before going live.

## ✅ Pre-Deployment Checklist

### Client Accounts Setup
- [ ] Client has created Supabase account
- [ ] Client has created Vercel account  
- [ ] Client has created GitHub account
- [ ] You've been invited as a collaborator on all platforms

### Supabase Configuration
- [ ] Supabase project is created
- [ ] All SQL commands from `supabase-setup.sql` have been run successfully
- [ ] `profiles` table exists
- [ ] `posts` table exists
- [ ] Row Level Security (RLS) is enabled on both tables
- [ ] All policies are created and active
- [ ] Storage bucket `post-images` is created
- [ ] Storage bucket is set to PUBLIC
- [ ] Storage policies are configured
- [ ] Trigger for new user registration is working
- [ ] First admin user has been created (UPDATE profiles SET is_admin = TRUE...)

### Local Development
- [ ] Project files extracted/cloned to local machine
- [ ] `npm install` completed successfully
- [ ] `.env.local` file created from `.env.local.example`
- [ ] Supabase URL added to `.env.local`
- [ ] Supabase anon key added to `.env.local`
- [ ] `next.config.js` updated with correct Supabase URL
- [ ] `npm run dev` runs without errors
- [ ] Can access http://localhost:3000
- [ ] Can sign up new user
- [ ] Can sign in
- [ ] Can create post
- [ ] Can upload image
- [ ] Can see posts in feed
- [ ] Admin can pin posts
- [ ] Admin can delete posts

### Code Repository
- [ ] GitHub repository created under client's account
- [ ] Initial commit made
- [ ] Code pushed to main branch
- [ ] Repository is private (if required)

### Vercel Deployment
- [ ] Vercel project created and linked to GitHub repo
- [ ] Environment variables added in Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] First deployment successful
- [ ] Can access production URL
- [ ] Test sign up on production
- [ ] Test sign in on production
- [ ] Test creating post on production
- [ ] Test image upload on production
- [ ] Test admin features on production

### Shopify Integration
- [ ] Production URL obtained from Vercel
- [ ] Iframe code prepared
- [ ] Iframe added to Shopify store
- [ ] Tested in Shopify environment
- [ ] Responsive design verified on mobile

## 📋 Post-Deployment

### Testing
- [ ] Sign up flow works correctly
- [ ] Email verification works
- [ ] Sign in works
- [ ] Create post works
- [ ] Image upload works (test with various image sizes)
- [ ] Posts appear in feed immediately
- [ ] Real-time updates work (open in two browsers)
- [ ] Pin/unpin works for admins
- [ ] Delete works for admins
- [ ] Sign out works
- [ ] Responsive on mobile devices
- [ ] Responsive on tablet devices
- [ ] Works in Shopify iframe

### Performance
- [ ] Images load quickly
- [ ] Page loads in under 3 seconds
- [ ] No console errors in browser
- [ ] Real-time updates are smooth

### Security
- [ ] Non-admin users cannot pin posts
- [ ] Non-admin users cannot delete other's posts
- [ ] Users cannot see admin panel features
- [ ] Environment variables are not exposed in frontend
- [ ] RLS policies prevent unauthorized access

### Documentation
- [ ] README.md is up to date
- [ ] Admin credentials documented securely
- [ ] Client has been trained on:
  - [ ] How to make new admins
  - [ ] How to manage posts
  - [ ] Where to find Supabase dashboard
  - [ ] Where to find Vercel dashboard
- [ ] Handover document created

## 🚨 Troubleshooting Common Issues

### "Failed to fetch"
- Check environment variables in Vercel
- Verify Supabase URL is correct
- Check RLS policies are enabled

### "Not authorized"
- Verify user exists in profiles table
- Check RLS policies
- Try signing out and back in

### "Image upload failed"
- Verify storage bucket exists and is public
- Check storage policies
- Verify image is under 5MB

### "Admin features not showing"
- Run SQL: `SELECT * FROM profiles WHERE email = 'admin@example.com'`
- Verify `is_admin` is TRUE
- Sign out and sign back in

## 📞 Support Contacts

**Supabase Support:**
- Dashboard: https://app.supabase.com
- Docs: https://supabase.com/docs

**Vercel Support:**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs

**Developer Contact:**
- [Your contact information]

## 🎉 Go Live Checklist

- [ ] All above items completed
- [ ] Client has tested thoroughly
- [ ] Client is satisfied with functionality
- [ ] Client knows how to add admins
- [ ] Client knows how to moderate posts
- [ ] Monitoring/analytics set up (optional)
- [ ] Client has access to all accounts
- [ ] Developer access can be revoked when needed

---

**Date Completed:** _______________

**Deployed By:** _______________

**Production URL:** _______________
