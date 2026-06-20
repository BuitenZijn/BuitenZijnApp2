"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface DropdownItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Activiteiten",
    dropdown: [
      { label: "Lijndansen", href: "/activiteiten/lijndansen" },
      { label: "Parelende Peloton", href: "/activiteiten/parelende-peloton" },
      { label: "Quiz", href: "/activiteiten/quiz" },
      { label: "Quizzen", href: "/activiteiten/quizzen" },
    ],
  },
  {
    label: "Shop",
    href: "/shop",
  },
  { label: "Contact", href: "/contact" },
];

function DropdownMenu({
  items,
  isOpen,
  onClose,
}: {
  items: DropdownItem[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black/5 py-1 z-50"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      )
        setUserMenuOpen(false);
    }
    if (userMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const displayName =
    user?.firstName || user?.name || user?.email?.split("@")[0] || "Gebruiker";

  return (
    <header className="bg-navy-800 border-b border-navy-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/buitenzijn_logo_white.png"
              alt="BuitenZijn"
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.label} className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.label ? null : item.label,
                      )
                    }
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {item.label}
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`}
                    />
                  </button>
                  <DropdownMenu
                    items={item.dropdown}
                    isOpen={openDropdown === item.label}
                    onClose={() => setOpenDropdown(null)}
                  />
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <UserCircleIcon className="w-6 h-6 text-green-400" />
                  <span>{displayName}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black/5 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {user?.roles?.join(", ") ?? "guest"}
                      </p>
                    </div>
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Uitloggen
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Inloggen
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                >
                  Registreren
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-navy-700 bg-navy-800 px-6 py-4 space-y-1">
          {navItems.map((item) =>
            item.dropdown ? (
              <div key={item.label}>
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === item.label ? null : item.label,
                    )
                  }
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-200"
                >
                  {item.label}
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`}
                  />
                </button>
                {openDropdown === item.label && (
                  <div className="ml-4 space-y-1">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-300 hover:text-green-400"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-200"
              >
                {item.label}
              </Link>
            ),
          )}
          <hr className="border-navy-700 my-2" />
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 text-sm text-gray-400">
                Ingelogd als{" "}
                <span className="font-medium text-gray-200">{displayName}</span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-200"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Uitloggen
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-200 border border-gray-500 rounded-lg hover:bg-white/10"
              >
                Inloggen
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-3 py-2 text-sm font-medium bg-green-500 text-white rounded-lg"
              >
                Registreren
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
