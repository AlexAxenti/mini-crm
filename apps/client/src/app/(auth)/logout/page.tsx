"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    };

    logout();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-fg">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we sign you out.
        </p>
      </div>
    </div>
  );
}
