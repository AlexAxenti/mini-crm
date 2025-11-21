"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/app/api-lib/mutations/user/logout";

export default function LogoutPage() {
  const router = useRouter();
  const logoutMutation = useLogout();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logoutMutation.mutateAsync();
        router.push("/login");
        router.refresh();
      } catch (error) {
        console.error("Logout error:", error);
        router.push("/login");
      }
    };

    performLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
