// app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { subject: loggedInSubject, loading } = useAuth();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (!loading && loggedInSubject) {
      router.push(`/dashboard/${loggedInSubject}`);
    }
  }, [loading, loggedInSubject, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Checking authentication status...</p>
      </div>
    );
  }

  // Display a simple message for now if not logged in
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="p-8 bg-gray-800 rounded-lg shadow-xl text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to QuizQuest Admin
        </h1>
        <p className="text-gray-300 mb-6">Please log in to continue.</p>
        {/*
          TODO: Implement your actual login form here.
          For now, a simple button can simulate a login (or you can remove it).
        */}
        <button
          onClick={() =>
            alert(
              "Login functionality not yet implemented. Redirecting for demo."
            )
          }
          className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Simulate Login
        </button>
      </div>
    </div>
  );
}
