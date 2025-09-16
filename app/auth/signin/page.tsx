import { signInAction } from "@/lib/actions";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Buyer Lead Intake System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your real estate leads
          </p>
        </div>
        <form action={signInAction} className="mt-8 space-y-6">
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Log in as Demo User
          </button>
        </form>
      </div>
    </div>
  );
}