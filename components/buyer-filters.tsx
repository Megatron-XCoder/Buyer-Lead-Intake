"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { City, PropertyType, Status, Timeline } from "@prisma/client";
import { useCallback, useState, useEffect } from "react";
import { Search } from "lucide-react";

interface BuyerFiltersProps {
  search: string;
  city: string;
  propertyType: string;
  status: string;
  timeline: string;
}

export default function BuyerFilters({
  search: initialSearch,
  city,
  propertyType,
  status,
  timeline,
}: BuyerFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      });
      
      // Reset to page 1 when filters change
      if (!params.page) {
        newSearchParams.delete("page");
      }
      
      return newSearchParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      router.push(`/buyers?${createQueryString({ search })}`);
    }, 500);
    
    setDebounceTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.push(`/buyers?${createQueryString({ [key]: value })}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, phone, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={city}
          onChange={(e) => handleFilterChange("city", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Cities</option>
          {Object.values(City).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={propertyType}
          onChange={(e) => handleFilterChange("propertyType", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Property Types</option>
          {Object.values(PropertyType).map((pt) => (
            <option key={pt} value={pt}>
              {pt}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          {Object.values(Status).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={timeline}
          onChange={(e) => handleFilterChange("timeline", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Timelines</option>
          {Object.values(Timeline).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}