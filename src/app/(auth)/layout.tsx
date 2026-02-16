import { ReactNode } from "react";

/**
 * Auth Layout
 * 
 * Shared layout for all authentication pages (login, register, etc.)
 */

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-beige-200 flex flex-col">
      {/* Header */}
      <header className="py-6">
        <div className="container mx-auto px-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-navy-800">BuitenZijn</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} VZW BuitenZijn. Alle rechten voorbehouden.</p>
      </footer>
    </div>
  );
}
