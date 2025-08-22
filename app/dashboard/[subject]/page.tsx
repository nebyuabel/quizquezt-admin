// app/dashboard/[subject]/page.tsx
"use client"; // This is a client component

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // Import useParams
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Assuming supabase is used here as well

export default function SubjectDashboardPage() {
  const router = useRouter();
  const { subject } = useParams(); // Use useParams hook to get subject
  const routeSubject = Array.isArray(subject) ? subject[0] : subject || "";

  const { subject: loggedInSubject, loading } = useAuth();
  const [hasNotes, setHasNotes] = useState(false);
  const [hasQuestions, setHasQuestions] = useState(false);
  const [hasFlashcards, setHasFlashcards] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);

  // Redirect if auth context not ready or subject mismatch
  useEffect(() => {
    if (
      !loading &&
      loggedInSubject &&
      loggedInSubject.toLowerCase() !== routeSubject.toLowerCase()
    ) {
      router.push("/dashboard"); // Or another appropriate redirect
    }
  }, [loading, loggedInSubject, routeSubject, router]);

  // Fetch content presence
  useEffect(() => {
    const checkContent = async () => {
      if (
        !loading &&
        loggedInSubject &&
        loggedInSubject.toLowerCase() === routeSubject.toLowerCase()
      ) {
        setContentLoading(true);

        const { count: notesCount, error: notesError } = await supabase
          .from("notes")
          .select("id", { count: "exact" })
          .ilike("subject", routeSubject)
          .limit(1);

        const { count: questionsCount, error: questionsError } = await supabase
          .from("questions")
          .select("id", { count: "exact" })
          .ilike("subject", routeSubject)
          .limit(1);

        const { count: flashcardsCount, error: flashcardsError } =
          await supabase
            .from("flashcards")
            .select("id", { count: "exact" })
            .ilike("subject", routeSubject)
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
    checkContent();
  }, [loading, loggedInSubject, routeSubject]);

  if (
    loading ||
    !loggedInSubject ||
    loggedInSubject.toLowerCase() !== routeSubject.toLowerCase()
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
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">
        {formattedSubject} Dashboard
      </h1>

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
