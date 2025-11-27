"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";
import CreatePostModal from "@/components/CreatePostModal";
import PostsFeed from "@/components/PostsFeed";
import NotificationBell from "@/components/NotificationBell";
import SearchBar from "@/components/SearchBar";
import { LogOut, Plus } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
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
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 border-2 border-primary">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-heading text-primary">K-Playground Community</h1>
              <p className="text-primary mt-1 text-sm sm:text-base">
                {user ? (
                  <>
                    Welcome, {username || user.email}
                    {isAdmin && <span className="ml-2 px-2 py-1 bg-warning text-white text-xs rounded-full font-bold">ADMIN</span>}
                  </>
                ) : (
                  "Share and discover great products"
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <NotificationBell userId={user.id} />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-bg-secondary text-primary border-2 border-primary rounded-md hover:bg-primary hover:text-white transition-colors font-bold whitespace-nowrap"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white border-2 border-primary rounded-md hover:bg-highlight hover:text-primary transition-colors font-bold whitespace-nowrap"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search posts by content or username..." />
        </div>

        {/* Posts Feed */}
        <PostsFeed isAdmin={isAdmin} userId={user?.id} refreshTrigger={refreshTrigger} searchQuery={searchQuery} />

        {/* Floating Action Button - Create Post (only when logged in) */}
        {user && (
          <button
            onClick={() => setShowCreatePostModal(true)}
            className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 bg-primary text-white rounded-full shadow-lg hover:bg-highlight hover:text-primary border-2 border-primary transition-all flex items-center justify-center z-40 hover:scale-110"
            title="Create new post"
          >
            <Plus size={28} className="sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Auth Modal */}
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

        {/* Create Post Modal */}
        {user && (
          <CreatePostModal
            isOpen={showCreatePostModal}
            onClose={() => setShowCreatePostModal(false)}
            userEmail={user.email}
            username={username}
            userId={user.id}
            onPostCreated={handlePostCreated}
          />
        )}
      </div>
    </div>
  );
}
