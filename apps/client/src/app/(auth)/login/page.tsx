"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Ensure user exists in database (fallback for users created before this feature)
      if (data.user) {
        try {
          // Try to get the user first
          const checkResponse = await fetch("/api/user");
          if (checkResponse.status === 404) {
            // User doesn't exist, create them
            await fetch("/api/user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email }),
            });
          }
        } catch (err) {
          console.error("Error ensuring user exists:", err);
          // Continue to dashboard even if this fails
        }
      }

      router.push("/contacts");
      router.refresh();
    }
  };

  return (
    <div className="p-8 bg-bg text-fg">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-bg text-fg border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 bg-bg text-fg border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link href="/signup" className="text-blue-600 hover:underline">
          Dont have an account? Sign up
        </Link>
      </div>

      <div className="mt-2 text-center text-sm">
        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
