"use client";

import { useEffect, useState } from "react";
import { supabase, Post, Comment as CommentType } from "@/lib/supabase";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

type PostDetailModalProps = {
  postId: string | null;
  currentUserId: string | undefined;
  currentUserEmail: string | undefined;
  currentUsername: string | undefined;
  isAdmin: boolean;
  onClose: () => void;
};

export default function PostDetailModal({ postId, currentUserId, currentUserEmail, currentUsername, isAdmin, onClose }: PostDetailModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!postId) return;

    const fetchPostAndComments = async () => {
      setLoading(true);

      // Fetch post
      const { data: postData, error: postError } = await supabase.from("posts").select("*").eq("id", postId).single();

      if (postError) {
        console.error("Error fetching post:", postError);
        onClose();
        return;
      }

      setPost(postData);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
      } else {
        setComments(commentsData || []);
      }

      setLoading(false);
    };

    fetchPostAndComments();

    // Subscribe to comment changes
    const subscription = supabase
      .channel(`post-${postId}-detail`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, () => {
        fetchPostAndComments();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [postId, onClose]);

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);

      if (error) throw error;
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const handleCommentAdded = (newComment: CommentType) => {
    // Immediately add the comment to the UI for instant feedback
    setComments((prev) => [...prev, newComment]);
    // Subscription will keep things in sync if needed
  };

  if (!postId) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Post Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : post ? (
          <>
            {/* Post Content */}
            <div className="p-3 sm:p-4 border-b border-gray-200">
              {/* Image Gallery */}
              {((post.image_urls && post.image_urls.length > 0) || post.image_url) && (
                <div className="relative mb-3 sm:mb-4">
                  {(() => {
                    const images = post.image_urls && post.image_urls.length > 0 ? post.image_urls : (post.image_url ? [post.image_url] : []);
                    const currentImage = images[currentImageIndex];

                    return (
                      <>
                        <img src={currentImage} alt={`Post image ${currentImageIndex + 1}`} className="w-full max-h-48 sm:max-h-64 object-cover rounded-lg" />

                        {/* Navigation Arrows - only show if more than 1 image */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full transition-colors"
                              title="Previous image"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full transition-colors"
                              title="Next image"
                            >
                              <ChevronRight size={20} />
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-bold">
                              {currentImageIndex + 1} / {images.length}
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="mb-2">
                <p className="font-semibold text-gray-900 text-sm sm:text-base break-all">{post.username || post.user_email}</p>
                <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{post.content}</p>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">
                Comments ({comments.length})
              </h3>
              {comments.length === 0 ? (
                <p className="text-gray-500 text-xs sm:text-sm text-center py-6 sm:py-8">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-1">
                  {comments.map((comment) => (
                    <Comment key={comment.id} comment={comment} currentUserId={currentUserId} isAdmin={isAdmin} onDelete={handleDeleteComment} />
                  ))}
                </div>
              )}
            </div>

            {/* Comment Form */}
            {currentUserId && currentUserEmail && currentUsername ? (
              <div className="p-3 sm:p-4 border-t border-gray-200">
                <CommentForm postId={postId} userId={currentUserId} userEmail={currentUserEmail} username={currentUsername} onCommentAdded={handleCommentAdded} />
              </div>
            ) : (
              <div className="p-3 sm:p-4 border-t border-gray-200 text-center text-gray-600 text-xs sm:text-sm">Sign in to leave a comment</div>
            )}
          </>
        ) : (
          <div className="p-4 text-center text-gray-600 text-sm sm:text-base">Post not found</div>
        )}
      </div>
    </div>
  );
}
