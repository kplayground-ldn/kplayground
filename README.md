# K-Playground Community Board

A modern community board application for Shopify store owners to share and discuss their products. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### For Users
- 📝 Create posts with text and images
- 🖼️ Upload product images (up to 5MB)
- 👀 View all community posts in real-time
- 🔐 Secure authentication

### For Admins
- 📌 Pin important announcements to the top
- 🗑️ Delete inappropriate posts
- 👑 Admin badge display

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

## Setup Instructions

### 1. Supabase Database Setup

After your client creates their Supabase account:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL commands:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

-- Create storage policy
CREATE POLICY "Anyone can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');
```

4. **Create Storage Bucket:**
   - Go to Storage in Supabase dashboard
   - If "post-images" bucket doesn't exist, create it
   - Make it public

5. **Make First Admin User:**
   - After signing up your first user, go to the SQL Editor
   - Run: `UPDATE profiles SET is_admin = TRUE WHERE email = 'your-admin-email@example.com';`

### 2. Local Development Setup

1. **Clone/Extract the project**
   ```bash
   cd k-playground-community
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Get your Supabase URL and anon key from:
     - Supabase Dashboard → Settings → API
   - Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Update next.config.js**
   - Replace `your-supabase-project.supabase.co` with your actual Supabase project URL

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

### 3. Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy!

3. **Embed in Shopify**
   - Once deployed, copy your Vercel URL
   - In Shopify, add an iframe with your URL

## Project Structure

```
k-playground-community/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── components/
│   ├── AuthForm.tsx         # Login/signup form
│   ├── CreatePostForm.tsx   # Post creation
│   ├── PostCard.tsx         # Individual post display
│   └── PostsFeed.tsx        # Posts list with real-time updates
├── lib/
│   └── supabase.ts          # Supabase client & types
├── .env.local               # Environment variables (create this)
├── .env.local.example       # Environment template
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Usage

### For Users
1. Sign up with email and password
2. Verify your email (check spam folder)
3. Sign in
4. Create posts with text and optional images
5. View community feed

### For Admins
1. Sign in as admin (after being granted admin status)
2. See admin badge next to your name
3. Use pin icon to pin/unpin posts
4. Use trash icon to delete posts

## Making Additional Admins

To grant admin access to another user:

1. Have them create an account first
2. Go to Supabase SQL Editor
3. Run:
```sql
UPDATE profiles SET is_admin = TRUE WHERE email = 'user@example.com';
```

## Customization

### Change Colors
Edit `tailwind.config.ts` to customize the color scheme.

### Adjust Post Limits
In `CreatePostForm.tsx`, change:
- `maxLength={1000}` for character limit
- `file.size > 5 * 1024 * 1024` for image size limit

### Modify Layout
The main layout is in `app/page.tsx` and uses a max-width container. Adjust `max-w-4xl` to change the width.

## Troubleshooting

### "Failed to fetch posts"
- Check your Supabase URL and anon key in `.env.local`
- Verify RLS policies are set correctly
- Check browser console for specific errors

### "Image upload failed"
- Verify storage bucket "post-images" exists and is public
- Check storage policies are set correctly
- Ensure image is under 5MB

### "Not authorized"
- Clear browser cache and cookies
- Sign out and sign back in
- Check that user exists in profiles table

## Support

For issues or questions, contact your development team.

## License

Private project - All rights reserved.
