// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext"; // Assuming this hook provides auth status

export default function HomePage() {
  const router = useRouter();
  const { subject: loggedInSubject, loading } = useAuth(); // Get auth status and user's subject

  useEffect(() => {
    if (!loading) {
      // Once authentication status is known
      if (loggedInSubject) {
        // If authenticated, redirect to their specific dashboard
        router.push(`/dashboard/${loggedInSubject}`);
      } else {
        // If not authenticated, redirect to the login page
        router.push("/login");
      }
    }
  }, [loading, loggedInSubject, router]); // Dependencies for useEffect

  // Show a loading message while authentication status is being determined
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <p className="text-white text-xl">Loading application...</p>
    </div>
  );
}
