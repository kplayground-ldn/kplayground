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
  is_hidden: boolean
  parent_comment_id: string | null
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

// Helper type for threaded comments with replies
export type CommentWithReplies = Comment & {
  replies: CommentWithReplies[]
}

// Organize flat comments into a threaded structure
// All comments (including hidden ones) are included in the structure
// The Comment component handles masking hidden content for unauthorized users
export function organizeComments(comments: Comment[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>()
  const rootComments: CommentWithReplies[] = []

  // Initialize all comments with empty replies array
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  // Build the tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!

    if (comment.parent_comment_id === null) {
      // Top-level comment
      rootComments.push(commentWithReplies)
    } else {
      // Reply to another comment
      const parent = commentMap.get(comment.parent_comment_id)
      if (parent) {
        parent.replies.push(commentWithReplies)
      }
    }
  })

  return rootComments
}
