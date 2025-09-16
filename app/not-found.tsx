import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full">
          <FileQuestion className="w-6 h-6 text-gray-600" />
        </div>
        <div className="mt-4 text-center">
          <h1 className="text-lg font-medium text-gray-900">Page not found</h1>
          <p className="mt-2 text-sm text-gray-500">
            The page you are looking for does not exist.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}