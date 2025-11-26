"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const error_description = searchParams.get("error_description");

        // Check for errors in the URL
        if (error) {
          console.error("Auth callback error:", error, error_description);
          router.push(`/?error=${error}`);
          return;
        }

        // If there's a code, exchange it for a session
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error("Error exchanging code for session:", exchangeError);
            router.push("/?error=auth_failed");
            return;
          }

          // Success! Redirect to home
          router.push("/?confirmed=true");
          return;
        }

        // Check for hash-based auth (older flow)
        const access_token = hashParams.get("access_token");
        if (access_token) {
          // Session is already set by Supabase automatically
          router.push("/?confirmed=true");
          return;
        }

        // No code or token, just redirect home
        router.push("/");
      } catch (error) {
        console.error("Unexpected error in auth callback:", error);
        router.push("/?error=unexpected");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-primary font-semibold">Confirming your email...</p>
      </div>
    </div>
  );
}
