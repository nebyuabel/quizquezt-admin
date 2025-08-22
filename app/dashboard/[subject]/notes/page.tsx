// app/dashboard/[subject]/notes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, useParams } from "next/navigation"; // Import useParams
import { Note } from "@/types/supabase";
import {
  ALL_GRADES,
  ALL_UNITS_DISPLAY,
  generateUnitFilter,
} from "@/lib/constants";
import { ConfirmationModal } from "@/components/ConfirmationModal";

// FIX: Remove params from function signature, use useParams hook instead
export default function NotesPage() {
  const router = useRouter();
  const { subject } = useParams(); // Use useParams hook
  const routeSubject = Array.isArray(subject) ? subject[0] : subject || "";

  const { subject: loggedInSubject, loading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const fetchNotes = async () => {
    setDataLoading(true);
    let query = supabase
      .from("notes")
      .select("*")
      .ilike("subject", routeSubject);

    if (selectedGrade) {
      query = query.eq("grade", selectedGrade);
    }
    if (selectedUnit) {
      const unitFilterString = generateUnitFilter(selectedUnit);
      if (unitFilterString) {
        query = query.or(unitFilterString);
      }
    }
    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const { data, error } = await query
      .order("unit", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error);
    } else {
      setNotes(data || []);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (
      !loading &&
      loggedInSubject &&
      loggedInSubject.toLowerCase() === routeSubject.toLowerCase()
    ) {
      fetchNotes();
    }
  }, [
    loading,
    loggedInSubject,
    routeSubject,
    selectedGrade,
    selectedUnit,
    searchQuery,
  ]);

  if (
    loading ||
    !loggedInSubject ||
    loggedInSubject.toLowerCase() !== routeSubject.toLowerCase()
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Redirecting...</div>
      </div>
    );
  }

  const formattedSubject =
    loggedInSubject.charAt(0).toUpperCase() + loggedInSubject.slice(1);

  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (noteToDelete) {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteToDelete);
      if (error) {
        alert("Failed to delete note.");
        console.error(error);
      } else {
        setNotes(notes.filter((note) => note.id !== noteToDelete));
        alert("Note deleted successfully!");
      }
      setIsDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push(`/dashboard/${routeSubject}`)}
            className="mr-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Go back to Dashboard"
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
            Manage {formattedSubject} Notes
          </h1>
        </div>
        <button
          onClick={() => router.push(`/dashboard/${routeSubject}/notes/new`)}
          className="px-6 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors"
        >
          Add New Note
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <label className="text-gray-400">Filter by Grade:</label>
        <select
          value={selectedGrade || ""}
          onChange={(e) => setSelectedGrade(e.target.value || null)}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
        >
          <option value="">All Grades</option>
          {ALL_GRADES.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
        <label className="text-gray-400">Filter by Unit:</label>
        <select
          value={selectedUnit || ""}
          onChange={(e) => setSelectedUnit(e.target.value || null)}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
        >
          <option value="">All Units</option>
          {ALL_UNITS_DISPLAY.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
        <label className="text-gray-400">Search Title:</label>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 flex-1 min-w-[200px]"
        />
      </div>

      {dataLoading ? (
        <p className="text-gray-400">Loading notes...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.length === 0 ? (
            <p className="text-gray-400">No notes found for this selection.</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="relative p-6 bg-gray-800 rounded-lg shadow-md hover:ring-2 hover:ring-purple-500 transition-all"
              >
                <button
                  onClick={() => handleDeleteClick(note.id)}
                  className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-500 transition-colors z-10"
                  title="Delete Note"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-trash-2"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </button>

                <div
                  onClick={() =>
                    router.push(`/dashboard/${routeSubject}/notes/${note.id}`)
                  }
                  className="cursor-pointer"
                >
                  <h2 className="text-xl font-semibold mb-2 text-purple-300">
                    {note.title?.substring(0, 100)}
                    {note.title && note.title.length > 100 ? "..." : ""}
                  </h2>
                  <p className="text-gray-400 mb-2 text-sm">
                    <span className="font-bold">Grade:</span>{" "}
                    {note.grade || "N/A"} |{" "}
                    <span className="font-bold">Unit:</span>{" "}
                    {note.unit || "N/A"}
                  </p>
                  <p className="text-gray-300 text-sm italic">
                    {note.content ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html:
                            note.content.substring(0, 150) +
                            (note.content.length > 150 ? "..." : ""),
                        }}
                      />
                    ) : (
                      "No content available."
                    )}
                  </p>
                  {note.is_premium && (
                    <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900 text-yellow-300">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
