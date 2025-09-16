"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  filters: {
    search?: string;
    city?: string;
    propertyType?: string;
    status?: string;
    timeline?: string;
  };
}

export default function ExportButton({ filters }: ExportButtonProps) {
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      
      const response = await fetch(`/api/buyers/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `buyer-leads-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Export completed successfully!");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
    >
      <Download className="inline-block w-4 h-4 mr-1" />
      CSV Export
    </button>
  );
}