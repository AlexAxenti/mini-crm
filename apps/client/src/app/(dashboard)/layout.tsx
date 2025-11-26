import Link from "next/link";
import { ThemeSelect } from "@/components/ThemeSelect";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Header/Nav */}
      <header className="border-b border-gray-300 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Mini CRM</h1>
            <nav className="flex gap-4">
              <Link
                href="/contacts"
                className="hover:text-blue-600 transition-colors"
              >
                Contacts
              </Link>
              <Link
                href="/events"
                className="hover:text-blue-600 transition-colors"
              >
                Events
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <ThemeSelect />
            <Link
              href="/logout"
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
