// app/dashboard/[subject]/notes/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { Note } from "@/types/supabase";
import { ALL_GRADES, ALL_UNITS_DISPLAY } from "@/lib/constants"; // Import ALL_UNITS_DISPLAY

// Dynamically import the TiptapEditor component with SSR disabled
const TiptapEditor = dynamic(
  () => import("@/components/TipTapEditor").then((mod) => mod.TiptapEditor),
  { ssr: false }
);

export default function NewNotePage({
  params,
}: {
  params: { subject: string };
}) {
  const { subject: loggedInSubject, loading } = useAuth();
  const router = useRouter();
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteGrade, setNoteGrade] = useState("");
  const [noteUnit, setNoteUnit] = useState(""); // Initialize with empty string for dropdown
  const [isPremium, setIsPremium] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false); // To control client-side rendering of Tiptap

  const { subject } = params;

  useEffect(() => {
    setIsClient(true); // Component has mounted on client
  }, []);

  // Protect the route
  if (
    loading ||
    !loggedInSubject ||
    loggedInSubject.toLowerCase() !== subject.toLowerCase()
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Redirecting...</div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    if (!noteTitle || !noteContent || !noteGrade) {
      alert("Title, content, and grade cannot be empty.");
      setIsSaving(false);
      return;
    }

    const noteData = {
      title: noteTitle,
      content: noteContent,
      grade: noteGrade,
      unit: noteUnit, // Use selected unit
      is_premium: isPremium,
      subject: loggedInSubject, // Use loggedInSubject from AuthContext
    };

    const { error } = await supabase.from("notes").insert([noteData]);

    if (error) {
      alert("Failed to save new note.");
      console.error(error);
    } else {
      alert("Note created successfully!");
      router.push(`/dashboard/${subject}/notes`);
    }
    setIsSaving(false);
  };

  return (
    <div className="p-8 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Create New Note for {subject}
      </h1>
      <input
        type="text"
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
        placeholder="Note Title"
        className="w-full px-4 py-2 mb-4 text-white bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <div className="grid grid-cols-2 gap-4 mb-4">
        <select
          value={noteGrade}
          onChange={(e) => setNoteGrade(e.target.value)}
          required
          className="px-4 py-2 text-white bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select a Grade...</option>
          {ALL_GRADES.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
        {/* Unit Selection Dropdown */}
        <select
          value={noteUnit}
          onChange={(e) => setNoteUnit(e.target.value)}
          className="px-4 py-2 text-white bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select a Unit...</option>
          {ALL_UNITS_DISPLAY.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={isPremium}
          onChange={(e) => setIsPremium(e.target.checked)}
          className="form-checkbox text-purple-600 h-5 w-5 rounded"
        />
        <span className="ml-2 text-white">Premium Content</span>
      </label>
      <div className="flex-1">
        {/* Ensure TiptapEditor is only rendered on the client */}
        {isClient && (
          <TiptapEditor
            initialContent={noteContent}
            onContentChange={setNoteContent}
          />
        )}
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={() => router.push(`/dashboard/${subject}/notes`)}
          className="px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Note"}
        </button>
      </div>
    </div>
  );
}
