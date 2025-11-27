"use client";

import { Post } from "@/lib/supabase";
import { Pin, Trash2, Image as ImageIcon, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type PostCardProps = {
  post: Post;
  isAdmin: boolean;
  currentUserId: string | undefined;
  onDelete: (postId: string) => void;
  onTogglePin: (postId: string, isPinned: boolean) => void;
};

export default function PostCard({ post, isAdmin, currentUserId, onDelete, onTogglePin }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const fetchCommentCount = async () => {
      const { count } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);
      setCommentCount(count || 0);
    };

    fetchCommentCount();

    // Subscribe to comment changes
    const subscription = supabase
      .channel(`post-${post.id}-comments`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${post.id}` }, () => {
        fetchCommentCount();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [post.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    await onDelete(post.id);
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onTogglePin(post.id, !post.is_pinned);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await handleDelete();
  };

  return (
    <Link href={`/posts/${post.id}`} className="block">
      <div className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow border-2 ${post.is_pinned ? "border-warning" : "border-primary"} cursor-pointer`}>
      {/* Image Thumbnail */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 bg-bg-secondary flex items-center justify-center overflow-hidden">
        {post.image_url ? (
          <img
            src={post.image_url}
            alt="Post image"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-primary">
            <ImageIcon size={48} />
            <p className="text-sm mt-2 font-semibold">No image</p>
          </div>
        )}

        {/* Pinned Badge */}
        {post.is_pinned && (
          <div className="absolute top-2 left-2 bg-warning text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold shadow-lg border-2 border-primary">
            <Pin size={12} className="fill-current" />
            <span>PINNED</span>
          </div>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={handleTogglePin}
              className={`p-2 rounded-md transition-colors shadow-md border-2 ${
                post.is_pinned
                  ? "bg-warning text-white border-primary hover:bg-primary"
                  : "bg-white text-primary border-primary hover:bg-primary hover:text-white"
              }`}
              title={post.is_pinned ? "Unpin post" : "Pin post"}
            >
              <Pin size={16} className={post.is_pinned ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-2 bg-danger text-white border-2 border-primary rounded-md hover:bg-primary transition-colors disabled:opacity-50 shadow-md"
              title="Delete post"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* User Info */}
        <div className="mb-2">
          <p className="font-bold text-primary text-sm truncate">{post.username || post.user_email}</p>
          <p className="text-xs text-primary/70">{formatDate(post.created_at)}</p>
        </div>

        {/* Post Content - Truncated */}
        <p className="text-primary text-sm line-clamp-3 whitespace-pre-wrap flex-grow">
          {post.content}
        </p>

        {/* Comment Count */}
        <div className="mt-3 flex items-center gap-2 text-primary text-sm font-semibold">
          <MessageCircle size={16} />
          <span>{commentCount} {commentCount === 1 ? "comment" : "comments"}</span>
        </div>
      </div>
    </div>
    </Link>
  );
}
