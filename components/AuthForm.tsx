"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Signed in successfully!");
        window.location.reload();
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-primary mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 sm:py-3 bg-bg-secondary border-2 border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-primary text-base"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-bold text-primary mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 sm:py-3 bg-bg-secondary border-2 border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-primary text-base"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-highlight hover:text-primary font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-2 border-primary text-base sm:text-lg"
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md border-2 ${
            message.includes("successfully") || message.includes("email")
              ? "bg-success/10 text-success border-success"
              : "bg-danger/10 text-danger border-danger"
          }`}
        >
          {message}
        </div>
      )}

      <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-4 text-sm text-danger hover:underline font-semibold">
        {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}
