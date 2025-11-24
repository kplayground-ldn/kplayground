"use client";

import { useEffect, useState } from "react";
import { supabase, Post } from "@/lib/supabase";
import PostCard from "./PostCard";

type PostsFeedProps = {
  isAdmin: boolean;
  userId: string | undefined;
  refreshTrigger: number;
};

export default function PostsFeed({ isAdmin, userId, refreshTrigger }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel("posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshTrigger]);

  const handleDelete = async (postId: string) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  const handleTogglePin = async (postId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase.from("posts").update({ is_pinned: isPinned }).eq("id", postId);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error("Error toggling pin:", error);
      alert("Failed to update post");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-600 text-lg">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isAdmin={isAdmin}
          currentUserId={userId}
          onDelete={handleDelete}
          onTogglePin={handleTogglePin}
        />
      ))}
    </div>
  );
}
