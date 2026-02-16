"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/app/providers";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

/**
 * Header Component
 * 
 * Top header bar for the dashboard with user menu and notifications.
 */

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side - Mobile menu button (for future mobile implementation) */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
          Welkom terug{user?.firstName ? `, ${user.firstName}` : ""}!
        </h1>
      </div>

      {/* Right side - Notifications & User menu */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-gray-100 relative">
          <BellIcon className="w-6 h-6 text-gray-600" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-rust-500 rounded-full" />
        </button>

        {/* User menu */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.name || user?.email || "Gebruiker"}
            </span>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="/dashboard/profile"
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 text-sm",
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    )}
                  >
                    <UserIcon className="w-4 h-4" />
                    Mijn profiel
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="/dashboard/settings"
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 text-sm",
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    )}
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    Instellingen
                  </a>
                )}
              </Menu.Item>
              <div className="border-t border-gray-100 my-1" />
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 text-sm w-full text-left",
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    )}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Uitloggen
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}
