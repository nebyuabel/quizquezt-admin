// app/dashboard/[subject]/page.tsx
"use client"; // This is a client component

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SubjectDashboardPage() {
  const router = useRouter();
  const { subject: urlSubjectParam } = useParams(); // Get the subject param from the URL

  // Ensure routeSubject is always a string. useParams can return string or string[].
  const routeSubject = Array.isArray(urlSubjectParam)
    ? urlSubjectParam[0]
    : urlSubjectParam || "";

  const { subject: loggedInSubject, loading, logout } = useAuth(); // Destructure logout from useAuth
  const [hasNotes, setHasNotes] = useState(false);
  const [hasQuestions, setHasQuestions] = useState(false);
  const [hasFlashcards, setHasFlashcards] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);

  // Redirect if auth context not ready or subject mismatch
  useEffect(() => {
    // Only proceed if loading is false and routeSubject is defined
    if (!loading && routeSubject) {
      if (
        !loggedInSubject ||
        loggedInSubject.toLowerCase() !== routeSubject.toLowerCase()
      ) {
        router.push("/login"); // Redirect to login if not logged in or subject doesn't match
      }
    }
  }, [loading, loggedInSubject, routeSubject, router]);

  // Fetch content presence
  useEffect(() => {
    const checkContent = async () => {
      // Only proceed if loading is false, loggedInSubject is present, and matches routeSubject
      if (
        !loading &&
        loggedInSubject &&
        loggedInSubject.toLowerCase() === routeSubject.toLowerCase()
      ) {
        setContentLoading(true);

        // All Supabase queries now use the guaranteed 'string' type `routeSubject`
        const { count: notesCount, error: notesError } = await supabase
          .from("notes")
          .select("id", { count: "exact" })
          .ilike("subject", routeSubject) // Using routeSubject (string)
          .limit(1);

        const { count: questionsCount, error: questionsError } = await supabase
          .from("questions")
          .select("id", { count: "exact" })
          .ilike("subject", routeSubject) // Using routeSubject (string)
          .limit(1);

        const { count: flashcardsCount, error: flashcardsError } =
          await supabase
            .from("flashcards")
            .select("id", { count: "exact" })
            .ilike("subject", routeSubject) // Using routeSubject (string)
            .limit(1);

        setHasNotes((notesCount || 0) > 0);
        setHasQuestions((questionsCount || 0) > 0);
        setHasFlashcards((flashcardsCount || 0) > 0);
        setContentLoading(false);

        if (notesError) console.error("Error checking notes:", notesError);
        if (questionsError)
          console.error("Error checking questions:", questionsError);
        if (flashcardsError)
          console.error("Error checking flashcards:", flashcardsError);
      }
    };
    // Ensure routeSubject is not empty before calling checkContent
    if (routeSubject) {
      checkContent();
    }
  }, [loading, loggedInSubject, routeSubject]);

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    router.push("/login"); // Redirect to login page after logging out
  };

  // Only render the dashboard if all necessary conditions are met
  if (
    loading ||
    !loggedInSubject ||
    loggedInSubject.toLowerCase() !== routeSubject.toLowerCase() ||
    !routeSubject
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const formattedSubject =
    loggedInSubject.charAt(0).toUpperCase() + loggedInSubject.slice(1);

  return (
    <div className="p-8 min-h-screen bg-gray-900 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-purple-400">
          {formattedSubject} Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      {contentLoading ? (
        <p className="text-gray-400 text-center">Checking for content...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Notes Section */}
          <Link
            href={`/dashboard/${routeSubject}/notes`}
            passHref
            legacyBehavior
          >
            <a className="block p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all transform hover:scale-105 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <h2 className="text-2xl font-semibold mb-2 relative z-10">
                Notes
              </h2>
              <p className="text-gray-300 relative z-10">
                Manage and create study notes for {formattedSubject}.
              </p>
              {hasNotes && (
                <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  Existing Notes
                </span>
              )}
            </a>
          </Link>

          {/* Questions Section */}
          <Link
            href={`/dashboard/${routeSubject}/questions`}
            passHref
            legacyBehavior
          >
            <a className="block p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all transform hover:scale-105 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <h2 className="text-2xl font-semibold mb-2 relative z-10">
                Questions
              </h2>
              <p className="text-gray-300 relative z-10">
                Create and review practice questions for {formattedSubject}.
              </p>
              {hasQuestions && (
                <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  Existing Questions
                </span>
              )}
            </a>
          </Link>

          {/* Flashcards Section */}
          <Link
            href={`/dashboard/${routeSubject}/flashcards`}
            passHref
            legacyBehavior
          >
            <a className="block p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-all transform hover:scale-105 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-800 to-yellow-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <h2 className="text-2xl font-semibold mb-2 relative z-10">
                Flashcards
              </h2>
              <p className="text-gray-300 relative z-10">
                Build and drill flashcards for quick memorization.
              </p>
              {hasFlashcards && (
                <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  Existing Flashcards
                </span>
              )}
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}
