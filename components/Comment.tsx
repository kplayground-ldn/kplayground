"use client";

import { Comment as CommentType } from "@/lib/supabase";
import { Trash2, EyeOff, Reply } from "lucide-react";
import { useState } from "react";
import CommentForm from "./CommentForm";

type CommentProps = {
  comment: CommentType;
  currentUserId: string | undefined;
  currentUserEmail: string | undefined;
  currentUsername: string | undefined;
  isAdmin: boolean;
  onDelete: (commentId: string) => void;
  onReplyAdded: (reply: CommentType) => void;
  depth?: number;
  replies?: CommentType[];
  postAuthorId: string;
  allComments?: CommentType[];
};

export default function Comment({
  comment,
  currentUserId,
  currentUserEmail,
  currentUsername,
  isAdmin,
  onDelete,
  onReplyAdded,
  depth = 0,
  replies = [],
  postAuthorId,
  allComments = [],
}: CommentProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Check if any parent comment in the chain is hidden
  const hasHiddenParent = () => {
    if (!comment.parent_comment_id) return false;

    let currentParentId: string | null = comment.parent_comment_id;
    while (currentParentId) {
      const parent = allComments.find(c => c.id === currentParentId);
      if (parent?.is_hidden) return true;
      currentParentId = parent?.parent_comment_id || null;
    }
    return false;
  };

  // Check if current user can view the actual content of a hidden comment/thread
  const canViewHiddenContent = () => {
    const isHiddenThread = comment.is_hidden || hasHiddenParent();
    if (!isHiddenThread) return true; // Public comment/thread, everyone can see
    if (!currentUserId) return false; // Not logged in, can't see hidden content

    // Comment author can always see their own comment
    if (currentUserId === comment.user_id) return true;

    // Post author can see all hidden comments/threads on their post
    if (currentUserId === postAuthorId) return true;

    // Check if user is an author in the parent chain (can see the thread)
    let currentParentId: string | null = comment.parent_comment_id;
    while (currentParentId) {
      const parent = allComments.find(c => c.id === currentParentId);
      if (parent && currentUserId === parent.user_id) {
        return true;
      }
      currentParentId = parent?.parent_comment_id || null;
    }

    return false;
  };

  // Check if this comment or any parent is hidden and user doesn't have access
  const isContentMasked = (comment.is_hidden || hasHiddenParent()) && !canViewHiddenContent();

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

  const handleReplyAdded = (reply: CommentType) => {
    onReplyAdded(reply);
    setShowReplyForm(false);
  };

  const canDelete = isAdmin || currentUserId === comment.user_id;
  const maxDepth = 3; // Limit nesting to 3 levels

  return (
    <div className="py-2 last:border-b-0">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-primary truncate">{comment.username || comment.user_email}</span>
              {/* Only show "Hidden" badge to users who can see the actual content */}
              {(comment.is_hidden || hasHiddenParent()) && !isContentMasked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/30">
                  <EyeOff size={12} />
                  Hidden
                </span>
              )}
            </div>
            <span className="text-xs text-primary/70">{formatDate(comment.created_at)}</span>
          </div>
          {/* Comment content - masked if user doesn't have access */}
          {isContentMasked ? (
            <p className="text-primary/50 text-xs sm:text-sm italic mb-2">
              This message is hidden
            </p>
          ) : (
            <p className="text-primary text-xs sm:text-sm whitespace-pre-wrap break-words mb-2">{comment.content}</p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {currentUserId && depth < maxDepth && !isContentMasked && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors font-semibold"
              >
                <Reply size={12} />
                <span>{showReplyForm ? "Cancel" : "Reply"}</span>
              </button>
            )}
            {replies.length > 0 && (
              <span className="text-xs text-primary/70 font-semibold">
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </span>
            )}
          </div>
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

      {/* Reply form */}
      {showReplyForm && currentUserId && currentUserEmail && currentUsername && (
        <div className="mt-3 ml-0 sm:ml-4">
          <CommentForm
            postId={comment.post_id}
            userId={currentUserId}
            userEmail={currentUserEmail}
            username={currentUsername}
            onCommentAdded={handleReplyAdded}
            parentCommentId={comment.id}
            isReply={true}
          />
        </div>
      )}

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="ml-4 sm:ml-8 mt-2 border-l-2 border-primary/20 pl-2 sm:pl-4">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              currentUserEmail={currentUserEmail}
              currentUsername={currentUsername}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onReplyAdded={onReplyAdded}
              depth={depth + 1}
              replies={[]}
              postAuthorId={postAuthorId}
              allComments={allComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
