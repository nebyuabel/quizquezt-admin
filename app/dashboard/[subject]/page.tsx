// app/dashboard/[subject]/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const contentTypes = ["Notes", "Questions", "Flashcards"];

export default function SubjectDashboard({
  params,
}: {
  params: { subject: string };
}) {
  const { subject: loggedInSubject, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !loggedInSubject) {
      router.push("/");
    } else if (
      loggedInSubject &&
      loggedInSubject.toLowerCase() !== params.subject.toLowerCase()
    ) {
      router.push(`/dashboard/${loggedInSubject.toLowerCase()}`);
    }
  }, [loggedInSubject, loading, params.subject, router]);

  if (loading || !loggedInSubject) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Redirecting...</div>
      </div>
    );
  }

  const formattedSubject =
    loggedInSubject.charAt(0).toUpperCase() + loggedInSubject.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-purple-400">
          {formattedSubject} Dashboard
        </h1>
        <button
          onClick={logout}
          className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors"
        >
          Log Out
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {contentTypes.map((type) => (
          <div
            key={type}
            className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg shadow-lg hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
            // --- CRITICAL CHANGE HERE: Use params.subject (original casing) for subject path ---
            onClick={() =>
              router.push(`/dashboard/${params.subject}/${type.toLowerCase()}`)
            }
          >
            <span className="text-6xl mb-4">
              {type === "Notes" && "📝"}
              {type === "Questions" && "❓"}
              {type === "Flashcards" && "🧠"}
            </span>
            <h2 className="text-2xl font-semibold">{type}</h2>
            <p className="text-gray-400 text-center mt-2">
              Manage {type.toLowerCase()} for {formattedSubject}.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
