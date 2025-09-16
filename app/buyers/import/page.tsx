"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import { toast } from "sonner";
import { Upload, Download, AlertCircle } from "lucide-react";
import type { CSVImportResult } from "@/lib/types";

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please select a CSV file");
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/buyers/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success && result.failedRows.length === 0) {
        toast.success(`Successfully imported ${result.successCount} leads!`);
      } else if (result.successCount > 0) {
        toast.warning(`Imported ${result.successCount} leads with ${result.failedRows.length} failures`);
      } else {
        toast.error("Import failed for all rows");
      }
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = `fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,status,notes,tags
John Doe,john@example.com,9876543210,CHANDIGARH,APARTMENT,BHK2,BUY,1000000,1500000,MONTHS_3,WEBSITE,NEW,"Looking for 2BHK in good locality","urgent,family"
Jane Smith,jane@example.com,9876543211,MOHALI,VILLA,BHK3,RENT,,50000,IMMEDIATE,REFERRAL,QUALIFIED,"Needs villa for rent","rental,urgent"`;
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buyer-leads-template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Import Leads</h1>
          <p className="text-gray-600 mt-2">Upload a CSV file to import buyer leads (max 200 rows)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Upload CSV File</h2>
            
            <div className="mb-4">
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Click to upload CSV file
                  </span>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".csv"
                    className="sr-only"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">CSV files only, max 200 rows</p>
              </div>
            </div>

            {isUploading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  <span className="text-sm text-gray-600">Uploading and processing...</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">CSV Format Requirements</h2>
            <div className="space-y-3 text-sm">
              <div>
                <h3 className="font-medium text-gray-900">Required Fields:</h3>
                <ul className="mt-1 text-gray-600 space-y-1">
                  <li>• fullName (2-80 characters)</li>
                  <li>• phone (10-15 digits)</li>
                  <li>• city (CHANDIGARH, MOHALI, ZIRAKPUR, PANCHKULA, OTHER)</li>
                  <li>• propertyType (APARTMENT, VILLA, PLOT, OFFICE, RETAIL)</li>
                  <li>• purpose (BUY, RENT)</li>
                  <li>• timeline (IMMEDIATE, MONTHS_3, MONTHS_6, EXPLORING)</li>
                  <li>• source (WEBSITE, REFERRAL, WALK_IN, CALL, OTHER)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Optional Fields:</h3>
                <ul className="mt-1 text-gray-600 space-y-1">
                  <li>• email (valid email format)</li>
                  <li>• bhk (required for APARTMENT/VILLA)</li>
                  <li>• budgetMin, budgetMax (numbers)</li>
                  <li>• status (defaults to NEW)</li>
                  <li>• notes (max 1000 characters)</li>
                  <li>• tags (comma-separated)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {importResult && (
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Import Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900">Total Rows</h3>
                <p className="text-2xl font-bold text-blue-600">{importResult.totalRows}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-900">Successful</h3>
                <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-red-900">Failed</h3>
                <p className="text-2xl font-bold text-red-600">{importResult.failedRows.length}</p>
              </div>
            </div>

            {importResult.failedRows.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  Failed Rows
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {importResult.failedRows.map((failure, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-red-800">Row {failure.row}:</span>
                        <span className="text-red-700 ml-2">{failure.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => router.push("/buyers")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View All Leads
              </button>
              <button
                onClick={() => setImportResult(null)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Import Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}