"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="mt-4 text-center">
          <h1 className="text-lg font-medium text-gray-900">Something went wrong!</h1>
          <p className="mt-2 text-sm text-gray-500">
            An error occurred while processing your request. Please try again.
          </p>
          <div className="mt-6">
            <button
              onClick={reset}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}