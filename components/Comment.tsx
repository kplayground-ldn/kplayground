"use client";

import { Comment as CommentType } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type CommentProps = {
  comment: CommentType;
  currentUserId: string | undefined;
  isAdmin: boolean;
  onDelete: (commentId: string) => void;
};

export default function Comment({ comment, currentUserId, isAdmin, onDelete }: CommentProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (!confirm("Are you sure you want to delete this comment?")) return;
    setIsDeleting(true);
    await onDelete(comment.id);
  };

  const canDelete = isAdmin || currentUserId === comment.user_id;

  return (
    <div className="border-b-2 border-primary/20 py-3 last:border-b-0">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <span className="font-bold text-xs sm:text-sm text-primary truncate">{comment.user_email}</span>
            <span className="text-xs text-primary/70">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-primary text-xs sm:text-sm whitespace-pre-wrap break-words">{comment.content}</p>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 text-danger hover:bg-danger/10 rounded transition-colors disabled:opacity-50 border border-danger flex-shrink-0"
            title="Delete comment"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
