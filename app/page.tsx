"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthForm from "@/components/AuthForm";
import CreatePostForm from "@/components/CreatePostForm";
import PostsFeed from "@/components/PostsFeed";
import { LogOut } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();

      if (error) throw error;
      setIsAdmin(data?.is_admin ?? false);
    } catch (error) {
      console.error("Error checking admin status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
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
    <div className="min-h-screen bg-bg-secondary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-primary">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-heading text-primary">K-Playground Community</h1>
              <p className="text-primary mt-1">
                {user ? (
                  <>
                    Welcome, {user.email}
                    {isAdmin && <span className="ml-2 px-2 py-1 bg-warning text-white text-xs rounded-full font-bold">ADMIN</span>}
                  </>
                ) : (
                  "Share and discover great products"
                )}
              </p>
            </div>
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-bg-secondary text-primary border-2 border-primary rounded-md hover:bg-primary hover:text-white transition-colors font-bold"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            ) : (
              <AuthForm />
            )}
          </div>
        </div>

        {/* Create Post Form - Only for logged in users */}
        {user && <CreatePostForm userEmail={user.email} userId={user.id} onPostCreated={handlePostCreated} />}

        {/* Sign in prompt for guests */}
        {!user && (
          <div className="bg-accent border-2 border-primary rounded-lg p-4 mb-6 text-center">
            <p className="text-primary font-semibold">Sign in above to create posts and leave comments</p>
          </div>
        )}

        {/* Posts Feed */}
        <PostsFeed isAdmin={isAdmin} userId={user?.id} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
