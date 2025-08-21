// app/dashboard/[subject]/flashcards/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { ALL_GRADES, ALL_UNITS_DISPLAY } from "@/lib/constants";
import { IndividualFlashcardInput } from "@/components/IndividualFlashcardInput";

// Dynamically import the BulkFlashcardEditor with SSR disabled
const BulkFlashcardEditor = dynamic(
  () =>
    import("@/components/BulkFlashcardEditor").then(
      (mod) => mod.BulkFlashcardEditor
    ),
  { ssr: false }
);

// ParsedFlashcard type for new page, excluding is_premium as it's a page-level state
interface ParsedFlashcard {
  front_text: string;
  back_text: string;
}

export default function NewFlashcardPage({
  params,
}: {
  params: { subject: string };
}) {
  const { subject: loggedInSubject, loading } = useAuth();
  const router = useRouter();

  const [flashcardGrade, setFlashcardGrade] = useState("");
  const [flashcardUnit, setFlashcardUnit] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputMode, setInputMode] = useState<"individual" | "bulk">(
    "individual"
  );

  const [parsedFlashcards, setParsedFlashcards] = useState<ParsedFlashcard[]>(
    []
  );
  const [bulkEditorContent, setBulkEditorContent] = useState("");

  const { subject } = params;

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

  // IndividualFlashcardInput's onCardsChange expects SingleFlashcard[], which does not have is_premium
  const handleIndividualCardsChange = (cards: ParsedFlashcard[]) => {
    // No need to add is_premium here, it's applied during save
    setParsedFlashcards(cards);
  };

  // BulkFlashcardEditor's onContentChange expects ParsedFlashcard[], which does not have is_premium
  const handleBulkEditorChange = (
    cards: ParsedFlashcard[],
    rawHtml: string
  ) => {
    // No need to add is_premium here, it's applied during save
    setParsedFlashcards(cards);
    setBulkEditorContent(rawHtml);
  };

  const handleSaveFlashcards = async () => {
    setIsSaving(true);
    if (
      !flashcardGrade ||
      parsedFlashcards.length === 0 ||
      parsedFlashcards.some((card) => !card.front_text || !card.back_text)
    ) {
      alert(
        "Please select a grade and ensure all flashcards have front and back text."
      );
      setIsSaving(false);
      return;
    }

    const flashcardsToInsert = parsedFlashcards.map((card) => ({
      ...card, // Contains front_text, back_text
      grade: flashcardGrade,
      subject: loggedInSubject,
      unit: flashcardUnit,
      is_premium: isPremium, // is_premium is added from the page's state here
    }));

    const { error } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert);

    if (error) {
      alert("Failed to save flashcards.");
      console.error(error);
    } else {
      alert("Flashcards created successfully!");
      router.push(`/dashboard/${subject}/flashcards`);
    }
    setIsSaving(false);
  };

  return (
    <div className="p-8 min-h-screen flex flex-col">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push(`/dashboard/${subject}/flashcards`)}
          className="mr-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          title="Go back to Flashcards"
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
          Create New Flashcards for {subject}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <select
          value={flashcardGrade}
          onChange={(e) => setFlashcardGrade(e.target.value)}
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
          value={flashcardUnit}
          onChange={(e) => setFlashcardUnit(e.target.value)}
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

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setInputMode("individual")}
          className={`px-6 py-3 rounded-l-md font-semibold transition-colors ${
            inputMode === "individual"
              ? "bg-purple-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Individual Flashcards
        </button>
        <button
          onClick={() => setInputMode("bulk")}
          className={`px-6 py-3 rounded-r-md font-semibold transition-colors ${
            inputMode === "bulk"
              ? "bg-purple-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Bulk Editor
        </button>
      </div>

      <div className="flex-1 mb-6">
        {inputMode === "individual" ? (
          <IndividualFlashcardInput
            onCardsChange={handleIndividualCardsChange}
          />
        ) : (
          <BulkFlashcardEditor
            initialContent={bulkEditorContent}
            onContentChange={handleBulkEditorChange}
          />
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-auto">
        <button
          onClick={() => router.push(`/dashboard/${subject}/flashcards`)}
          className="px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveFlashcards}
          disabled={
            isSaving ||
            parsedFlashcards.length === 0 ||
            parsedFlashcards.some((card) => !card.front_text || !card.back_text)
          }
          className="px-6 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Flashcards"}
        </button>
      </div>
    </div>
  );
}
