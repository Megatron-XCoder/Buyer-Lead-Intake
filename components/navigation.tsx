"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions";
import { Home, UserPlus, Users, LogOut, Upload } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? "bg-indigo-700" : "";
  };

  return (
    <nav className="bg-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">Buyer Lead Intake</h1>
            </div>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 ${isActive("/")}`}
              >
                <Home className="inline-block w-4 h-4 mr-1" />
                Dashboard
              </Link>
              <Link
                href="/buyers"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 ${isActive("/buyers")}`}
              >
                <Users className="inline-block w-4 h-4 mr-1" />
                Leads
              </Link>
              <Link
                href="/buyers/new"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 ${isActive("/buyers/new")}`}
              >
                <UserPlus className="inline-block w-4 h-4 mr-1" />
                New Lead
              </Link>
              <Link
                href="/buyers/import"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 ${isActive("/buyers/import")}`}
              >
                <Upload className="inline-block w-4 h-4 mr-1" />
                Import
              </Link>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              <LogOut className="inline-block w-4 h-4 mr-1" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}