"use client";

import { useState } from "react";
import { supabase, Comment } from "@/lib/supabase";
import { Send, EyeOff } from "lucide-react";

type CommentFormProps = {
  postId: string;
  userId: string;
  userEmail: string;
  username: string;
  onCommentAdded: (comment: Comment) => void;
  parentCommentId?: string;
  isReply?: boolean;
};

export default function CommentForm({
  postId,
  userId,
  userEmail,
  username,
  onCommentAdded,
  parentCommentId,
  isReply = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHidden, setIsHidden] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const commentData: any = {
        post_id: postId,
        user_id: userId,
        user_email: userEmail,
        username: username,
        content: content.trim(),
        is_hidden: isHidden,
      };

      // Add parent_comment_id if this is a reply
      if (parentCommentId) {
        commentData.parent_comment_id = parentCommentId;
      }

      const { data, error: insertError } = await supabase
        .from("comments")
        .insert(commentData)
        .select()
        .single();

      if (insertError) throw insertError;

      setContent("");
      setIsHidden(false);

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
    <form onSubmit={handleSubmit} className={isReply ? "pt-2" : "border-t-2 border-primary pt-4"}>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isReply ? "Write a reply..." : "Write a comment..."}
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
          {loading ? "..." : isReply ? "Reply" : "Send"}
        </button>
      </div>

      {/* Hidden comment toggle */}
      <div className="mt-2 flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={isHidden}
            onChange={(e) => setIsHidden(e.target.checked)}
            className="w-4 h-4 border-2 border-primary rounded cursor-pointer accent-primary"
          />
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-primary group-hover:text-secondary transition-colors">
            <EyeOff size={14} />
            <span className="font-semibold">Hidden {isReply ? "reply" : "comment"}</span>
          </div>
        </label>
        <span className="text-xs text-primary/70">
          (Only you and the post author can see this)
        </span>
      </div>

      {error && <div className="text-danger text-xs mt-2 font-semibold">{error}</div>}
    </form>
  );
}
