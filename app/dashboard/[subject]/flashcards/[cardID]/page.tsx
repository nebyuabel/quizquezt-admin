// app/dashboard/[subject]/flashcards/[cardID]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // Import useParams
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { ALL_GRADES, ALL_UNITS_DISPLAY } from "@/lib/constants";
import { IndividualFlashcardInput } from "@/components/IndividualFlashcardInput";

interface SingleFlashcardForInput {
  front_text: string;
  back_text: string;
  id?: string;
}

// FIX: Remove params from function signature, use useParams hook instead
export default function EditFlashcardPage() {
  const router = useRouter();
  const { subject, cardID } = useParams(); // Use useParams hook

  // Ensure subject and cardID are strings; they come from URL so they should be.
  const routeSubject = Array.isArray(subject) ? subject[0] : subject || "";
  const routeCardID = Array.isArray(cardID) ? cardID[0] : cardID || "";

  const { subject: loggedInSubject, loading } = useAuth();

  const [flashcardGrade, setFlashcardGrade] = useState("");
  const [flashcardUnit, setFlashcardUnit] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [cardToEdit, setCardToEdit] = useState<SingleFlashcardForInput[]>([]);

  useEffect(() => {
    // Only fetch if cardID is valid (not 'new') and auth context is loaded and subjects match
    if (
      routeCardID !== "new" &&
      !loading &&
      loggedInSubject &&
      loggedInSubject.toLowerCase() === routeSubject.toLowerCase()
    ) {
      const fetchFlashcard = async () => {
        setPageLoading(true);
        const { data, error } = await supabase
          .from("flashcards")
          .select("*")
          .eq("id", routeCardID)
          .single();

        if (error || !data) {
          console.error("Error fetching flashcard:", error);
          alert("Flashcard not found or an error occurred.");
          router.push(`/dashboard/${routeSubject}/flashcards`);
        } else {
          setFlashcardGrade(data.grade || "");
          setFlashcardUnit(data.unit || "");
          setIsPremium(data.is_premium || false);
          setCardToEdit([
            {
              id: data.id,
              front_text: data.front_text,
              back_text: data.back_text,
            },
          ]);
        }
        setPageLoading(false);
      };
      fetchFlashcard();
    } else if (routeCardID === "new") {
      // If it's a new card page, set loading to false after auth check
      setPageLoading(false);
    }
  }, [routeCardID, loading, loggedInSubject, routeSubject, router]);

  const handleIndividualCardsChange = (cards: SingleFlashcardForInput[]) => {
    if (cards.length > 0) {
      setCardToEdit([cards[0]]);
    } else {
      setCardToEdit([]);
    }
  };

  const handleSaveFlashcard = async () => {
    setIsSaving(true);
    if (
      cardToEdit.length === 0 ||
      !cardToEdit[0].front_text ||
      !cardToEdit[0].back_text ||
      !flashcardGrade
    ) {
      alert("Please ensure front text, back text, and grade are not empty.");
      setIsSaving(false);
      return;
    }

    const updatedCard = {
      front_text: cardToEdit[0].front_text,
      back_text: cardToEdit[0].back_text,
      grade: flashcardGrade,
      subject: loggedInSubject,
      unit: flashcardUnit,
      is_premium: isPremium,
    };

    const { error } = await supabase
      .from("flashcards")
      .update(updatedCard)
      .eq("id", routeCardID);

    if (error) {
      alert("Failed to update flashcard.");
      console.error(error);
    } else {
      alert("Flashcard updated successfully!");
      router.push(`/dashboard/${routeSubject}/flashcards`);
    }
    setIsSaving(false);
  };

  if (
    loading ||
    pageLoading ||
    !loggedInSubject ||
    loggedInSubject.toLowerCase() !== routeSubject.toLowerCase()
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Loading flashcard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen flex flex-col">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push(`/dashboard/${routeSubject}/flashcards`)}
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
        <h1 className="text-3xl font-bold text-white">Edit Flashcard</h1>
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
          value={flashcardUnit || ""}
          onChange={(e) => setFlashcardUnit(e.target.value || "")}
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

      <div className="flex-1 mb-6">
        <IndividualFlashcardInput
          initialCards={cardToEdit}
          onCardsChange={handleIndividualCardsChange}
        />
      </div>

      <div className="flex justify-end space-x-4 mt-auto">
        <button
          onClick={() => router.push(`/dashboard/${routeSubject}/flashcards`)}
          className="px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveFlashcard}
          disabled={
            isSaving ||
            cardToEdit.length === 0 ||
            !cardToEdit[0].front_text ||
            !cardToEdit[0].back_text ||
            !flashcardGrade
          }
          className="px-6 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
