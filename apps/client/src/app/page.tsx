"use client";

import { useUser } from "@/providers/UserProvider";
import Link from "next/link";

export default function Home() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">
          Mini CRM
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-md">
          Manage your contacts and grow your business
        </p>

        <div className="pt-8">
          {user ? (
            <Link
              href="/contacts"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-block px-8 py-3 bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
