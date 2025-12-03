"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        // Validate password match
        if (password !== confirmPassword) {
          setMessage("Passwords do not match!");
          setLoading(false);
          return;
        }

        // Validate username
        if (!username.trim()) {
          setMessage("Username is required!");
          setLoading(false);
          return;
        }

        if (username.length < 3) {
          setMessage("Username must be at least 3 characters!");
          setLoading(false);
          return;
        }

        if (username.length > 20) {
          setMessage("Username must be less than 20 characters!");
          setLoading(false);
          return;
        }

        // Check for valid username characters (alphanumeric, underscore, hyphen)
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
          setMessage("Username can only contain letters, numbers, underscore, and hyphen!");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username: username.trim(),
            },
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

        {isSignUp && (
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-primary mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_-]+"
              className="w-full px-3 py-2 sm:py-3 bg-bg-secondary border-2 border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-primary text-base"
              placeholder="username123"
            />
            <p className="text-xs text-primary/70 mt-1">3-20 characters, letters, numbers, underscore, or hyphen</p>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-bold text-primary mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 sm:py-3 pr-10 bg-bg-secondary border-2 border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-primary text-base"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-secondary transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {isSignUp && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-primary mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 sm:py-3 pr-10 bg-bg-secondary border-2 border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-primary text-base"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-secondary transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        )}

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

      <button
        onClick={() => {
          setIsSignUp(!isSignUp);
          setConfirmPassword("");
          setUsername("");
          setMessage("");
        }}
        className="w-full mt-4 text-sm text-danger hover:underline font-semibold"
      >
        {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}
