import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Post = {
  id: string
  user_id: string
  user_email: string
  username: string
  content: string
  image_url: string | null  // Keep for backward compatibility
  image_urls: string[]  // New field for multiple images
  is_pinned: boolean
  created_at: string
}

export type Comment = {
  id: string
  post_id: string
  user_id: string
  user_email: string
  username: string
  content: string
  created_at: string
}

export type Profile = {
  id: string
  email: string
  username: string
  is_admin: boolean
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  type: string  // 'comment', 'like', etc.
  post_id: string
  actor_id: string
  actor_username: string
  content: string
  is_read: boolean
  created_at: string
}
