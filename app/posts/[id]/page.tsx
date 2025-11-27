"use client";

import { useEffect, useState } from "react";
import { supabase, Post, Comment as CommentType } from "@/lib/supabase";
import { ArrowLeft, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Comment from "@/components/Comment";
import CommentForm from "@/components/CommentForm";
import Link from "next/link";

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("is_admin, username").eq("id", userId).single();
      if (error) throw error;
      setIsAdmin(data?.is_admin ?? false);
      setUsername(data?.username ?? "");
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  useEffect(() => {
    const fetchPostAndComments = async () => {
      setLoading(true);

      // Fetch post
      const { data: postData, error: postError } = await supabase.from("posts").select("*").eq("id", params.id).single();

      if (postError) {
        console.error("Error fetching post:", postError);
        setLoading(false);
        return;
      }

      setPost(postData);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", params.id)
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
      .channel(`post-${params.id}-detail`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${params.id}` }, () => {
        fetchPostAndComments();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [params.id]);

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

  const handleCommentAdded = () => {
    // Refresh will happen via subscription
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-white shadow-sm border-b-2 border-primary sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-primary hover:text-danger transition-colors font-bold text-sm sm:text-base">
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span>Back to Posts</span>
            </Link>
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-bg-secondary text-primary border-2 border-primary rounded-md hover:bg-primary hover:text-white transition-colors font-bold text-sm whitespace-nowrap"
              >
                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-primary font-semibold">Loading...</p>
          </div>
        ) : post ? (
          <div className="space-y-6">
            {/* Post Content */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-primary">
              {/* Image Gallery */}
              {((post.image_urls && post.image_urls.length > 0) || post.image_url) && (
                <div className="relative w-full bg-bg-secondary flex items-center justify-center overflow-hidden">
                  {(() => {
                    const images = post.image_urls && post.image_urls.length > 0 ? post.image_urls : (post.image_url ? [post.image_url] : []);
                    const currentImage = images[currentImageIndex];

                    return (
                      <>
                        <img
                          src={currentImage}
                          alt={`Post image ${currentImageIndex + 1}`}
                          className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] object-contain"
                        />

                        {/* Navigation Arrows - only show if more than 1 image */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-colors"
                              title="Previous image"
                            >
                              <ChevronLeft size={24} className="sm:w-8 sm:h-8" />
                            </button>
                            <button
                              onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-colors"
                              title="Next image"
                            >
                              <ChevronRight size={24} className="sm:w-8 sm:h-8" />
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-bold">
                              {currentImageIndex + 1} / {images.length}
                            </div>

                            {/* Thumbnail Dots */}
                            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                              {images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
                                  }`}
                                  title={`Go to image ${index + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                    <p className="font-heading text-primary text-base sm:text-lg break-all">{post.username || post.user_email}</p>
                    {post.is_pinned && (
                      <span className="px-2 py-1 bg-warning text-white text-xs rounded-full font-bold border-2 border-primary self-start">PINNED</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-primary/70">{formatDate(post.created_at)}</p>
                </div>
                <p className="text-primary whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{post.content}</p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-2 border-primary">
              <h3 className="font-heading text-primary text-lg sm:text-xl mb-4">Comments ({comments.length})</h3>

              {comments.length === 0 ? (
                <p className="text-primary/70 text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-1 mb-6">
                  {comments.map((comment) => (
                    <Comment key={comment.id} comment={comment} currentUserId={user?.id} isAdmin={isAdmin} onDelete={handleDeleteComment} />
                  ))}
                </div>
              )}

              {/* Comment Form */}
              {user ? (
                <CommentForm postId={params.id} userId={user.id} userEmail={user.email} username={username} onCommentAdded={handleCommentAdded} />
              ) : (
                <div className="border-t-2 border-primary pt-4">
                  <div className="bg-accent border-2 border-primary rounded-lg p-4 text-center">
                    <p className="text-primary font-semibold">
                      <Link href="/" className="font-bold underline hover:text-danger">
                        Sign in
                      </Link>{" "}
                      to leave a comment
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-primary">
            <p className="text-primary text-lg mb-4 font-semibold">Post not found</p>
            <Link href="/" className="text-danger hover:underline font-bold">
              Return to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
