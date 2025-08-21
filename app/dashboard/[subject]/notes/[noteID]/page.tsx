// app/dashboard/[subject]/notes/[noteID]/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { Note } from "@/types/supabase";
import { ALL_GRADES, ALL_UNITS_DISPLAY } from "@/lib/constants";

// Dynamically import the TiptapEditor component with SSR disabled
const TiptapEditor = dynamic(
  () => import("@/components/TipTapEditor").then((mod) => mod.TiptapEditor),
  { ssr: false }
);

// FIX: Directly define the type of 'params' in the function signature
export default function NoteEditor({
  params,
}: {
  params: { subject: string; noteID: string };
}) {
  const { subject: loggedInSubject, loading } = useAuth();
  const router = useRouter();
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteGrade, setNoteGrade] = useState("");
  const [noteUnit, setNoteUnit] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const { subject, noteID } = params;
  const isNewNote = noteID === "new";

  useEffect(() => {
    setIsClient(true);

    if (
      !isNewNote &&
      !loading &&
      loggedInSubject &&
      loggedInSubject.toLowerCase() === subject.toLowerCase()
    ) {
      const fetchNote = async () => {
        setPageLoading(true);
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .eq("id", noteID)
          .single();

        if (error || !data) {
          console.error("Error fetching note:", error);
          alert("Note not found or an error occurred.");
          router.push(`/dashboard/${subject}/notes`);
        } else {
          setNoteTitle(data.title || "");
          setNoteContent(data.content || "");
          setNoteGrade(data.grade || "");
          setNoteUnit(data.unit || "");
          setIsPremium(data.is_premium || false);
        }
        setPageLoading(false);
      };
      fetchNote();
    } else if (isNewNote) {
      setPageLoading(false);
    }
  }, [noteID, isNewNote, loading, loggedInSubject, subject, router]);

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
      unit: noteUnit,
      is_premium: isPremium,
      subject: loggedInSubject,
    };

    if (isNewNote) {
      const { error } = await supabase.from("notes").insert([noteData]);
      if (error) {
        alert("Failed to save new note.");
        console.error(error);
      } else {
        alert("Note created successfully!");
        router.push(`/dashboard/${subject}/notes`);
      }
    } else {
      const { error } = await supabase
        .from("notes")
        .update(noteData)
        .eq("id", noteID);
      if (error) {
        alert("Failed to update note.");
        console.error(error);
      } else {
        alert("Note updated successfully!");
        router.push(`/dashboard/${subject}/notes`);
      }
    }
    setIsSaving(false);
  };

  if (
    loading ||
    pageLoading ||
    !loggedInSubject ||
    loggedInSubject.toLowerCase() !== subject.toLowerCase()
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">
          {isNewNote ? "Loading editor..." : "Loading note..."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen flex flex-col">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push(`/dashboard/${subject}/notes`)}
          className="mr-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          title="Go back to Notes"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-left text-white"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-white">
          {isNewNote ? "Create New Note" : `Edit Note: ${noteTitle}`}
        </h1>
      </div>
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
