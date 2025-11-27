"use client";

import { useState } from "react";
import { supabase, Comment } from "@/lib/supabase";
import { Send } from "lucide-react";

type CommentFormProps = {
  postId: string;
  userId: string;
  userEmail: string;
  username: string;
  onCommentAdded: (comment: Comment) => void;
};

export default function CommentForm({ postId, userId, userEmail, username, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: insertError } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: userId,
        user_email: userEmail,
        username: username,
        content: content.trim(),
      }).select().single();

      if (insertError) throw insertError;

      setContent("");

      // Pass the newly created comment to the parent
      if (data) {
        onCommentAdded(data);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t-2 border-primary pt-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          required
          maxLength={500}
          className="flex-1 px-3 py-2 sm:py-3 bg-bg-secondary border-2 border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-sm sm:text-base text-primary"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 sm:py-3 bg-primary text-white rounded-md hover:bg-highlight hover:text-primary border-2 border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-bold text-sm sm:text-base whitespace-nowrap"
        >
          <Send size={16} />
          {loading ? "..." : "Send"}
        </button>
      </div>
      {error && <div className="text-danger text-xs mt-2 font-semibold">{error}</div>}
    </form>
  );
}
