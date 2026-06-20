"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  CreditCardIcon,
  TicketIcon,
  QrCodeIcon,
  CalculatorIcon,
  GlobeAltIcon,
  PuzzlePieceIcon,
  TrophyIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/app/providers";

/**
 * Sidebar Component
 *
 * Navigation sidebar for the dashboard.
 */

const navigation = [
  { name: "Overzicht", href: "/admin", icon: HomeIcon },
  { name: "Gebruikers", href: "/admin/users", icon: UserGroupIcon },
];

const linedanceNavigation = [
  {
    name: "Danskrediet",
    href: "/admin/linedance/credits",
    icon: CreditCardIcon,
  },
  {
    name: "Sessies",
    href: "/admin/linedance/sessions",
    icon: QrCodeIcon,
  },
];

const ellaNavigation = [
  { name: "Knutselen", href: "/admin/ella", icon: TicketIcon },
  {
    name: "Rekenen",
    href: "/admin/ella/rekenen",
    icon: CalculatorIcon,
  },
  {
    name: "Dinosaurussen",
    href: "/admin/ella/dinosaurussen",
    icon: GlobeAltIcon,
  },
  {
    name: "Planeten",
    href: "/admin/ella/planeten",
    icon: GlobeAltIcon,
  },
  {
    name: "Memory",
    href: "/admin/ella/memory",
    icon: PuzzlePieceIcon,
  },
];

const quizNavigation = [
  {
    name: "Quizzen",
    href: "/admin/quizzen",
    icon: PuzzlePieceIcon,
  },
];

const pronoNavigation = [
  {
    name: "Prono",
    href: "/admin/prono",
    icon: TrophyIcon,
  },
];

const shopNavigation = [
  {
    name: "Producten & Bestellingen",
    href: "/admin/shop",
    icon: ShoppingBagIcon,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-lg font-bold text-navy-800">BuitenZijn</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Admin section */}
        {user?.roles?.includes("admin") && (
          <>
            {/* Lijndans sub-section */}
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                💃 Lijndans
              </h3>
              <div className="mt-2 space-y-1">
                {linedanceNavigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-green-50 text-green-700"
                          : "text-gray-700 hover:bg-gray-100",
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ELLA sub-section */}
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                🎀 ELLA
              </h3>
              <div className="mt-2 space-y-1">
                {ellaNavigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-pink-50 text-pink-700"
                          : "text-gray-700 hover:bg-gray-100",
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quiz sub-section */}
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                🎯 Buzz Quiz
              </h3>
              <div className="mt-2 space-y-1">
                {quizNavigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-700 hover:bg-gray-100",
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Prono sub-section */}
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ⚽ Prono
              </h3>
              <div className="mt-2 space-y-1">
                {pronoNavigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-700 hover:bg-gray-100",
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Shop sub-section */}
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                🛍️ Shop
              </h3>
              <div className="mt-2 space-y-1">
                {shopNavigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-amber-50 text-amber-700"
                          : "text-gray-700 hover:bg-gray-100",
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || user?.email || "Gebruiker"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.roles?.includes("admin") ? "Beheerder" : "Lid"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
