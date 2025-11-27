"use client";

import { useEffect, useState } from "react";
import { supabase, Post } from "@/lib/supabase";
import PostCard from "./PostCard";

type PostsFeedProps = {
  isAdmin: boolean;
  userId: string | undefined;
  refreshTrigger: number;
  searchQuery?: string;
};

export default function PostsFeed({ isAdmin, userId, refreshTrigger, searchQuery = "" }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
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

  // Filter posts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = posts.filter((post) => {
      // Search in post content
      const contentMatch = post.content.toLowerCase().includes(query);
      // Search in username
      const usernameMatch = post.username?.toLowerCase().includes(query);
      // Search in email (fallback)
      const emailMatch = post.user_email?.toLowerCase().includes(query);

      return contentMatch || usernameMatch || emailMatch;
    });

    setFilteredPosts(filtered);
  }, [posts, searchQuery]);

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
      <div className="text-center py-12 bg-white rounded-lg shadow-md border-2 border-primary">
        <p className="text-primary text-lg font-semibold">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  if (filteredPosts.length === 0 && searchQuery.trim()) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md border-2 border-primary">
        <p className="text-primary text-lg font-semibold">No posts found matching "{searchQuery}"</p>
        <p className="text-primary/70 text-sm mt-2">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPosts.map((post) => (
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
