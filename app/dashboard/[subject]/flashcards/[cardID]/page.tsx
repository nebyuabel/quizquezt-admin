// app/dashboard/[subject]/flashcards/[cardID]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
// Assuming Flashcard type is correctly imported or defined elsewhere
// import { Flashcard } from "@/types/supabase";
import { ALL_GRADES, ALL_UNITS_DISPLAY } from "@/lib/constants";
import { IndividualFlashcardInput } from "@/components/IndividualFlashcardInput";

interface SingleFlashcardForInput {
  front_text: string;
  back_text: string;
  id?: string;
}

export default function FlashcardPage({
  params,
}: {
  params: { subject: string; cardID: string };
}) {
  const { subject: routeSubject, cardID } = params;

  // Renamed `loading` from useAuth to `authLoading` for clarity
  const { subject: loggedInSubject, loading: authLoading } = useAuth();
  const router = useRouter();

  const [flashcardGrade, setFlashcardGrade] = useState("");
  const [flashcardUnit, setFlashcardUnit] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Manages loading state for page content

  const [cardToEdit, setCardToEdit] = useState<SingleFlashcardForInput[]>([]);

  useEffect(() => {
    // 1. If authentication is still loading, wait.
    if (authLoading) {
      return;
    }

    // 2. After authentication loads, check if user is authorized for this subject.
    // If loggedInSubject is null/undefined or doesn't match routeSubject, redirect.
    if (
      !loggedInSubject ||
      loggedInSubject.toLowerCase() !== routeSubject.toLowerCase()
    ) {
      router.push(`/dashboard/${routeSubject}`); // Redirect to the subject's dashboard
      return;
    }

    // 3. Handle fetching an existing flashcard or initializing a new one.
    if (cardID !== "new") {
      // Logic for editing an existing flashcard
      const fetchFlashcard = async () => {
        setPageLoading(true); // Start page-specific loading
        const { data, error } = await supabase
          .from("flashcards")
          .select("*")
          .eq("id", cardID)
          .single();

        if (error || !data) {
          console.error("Error fetching flashcard:", error);
          // Instead of alert, consider a more user-friendly modal or toast
          alert("Flashcard not found or an error occurred.");
          router.push(`/dashboard/${routeSubject}/flashcards`); // Redirect if flashcard isn't found
        } else {
          // Populate state with fetched data
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
        setPageLoading(false); // End page-specific loading
      };
      fetchFlashcard();
    } else {
      // Logic for creating a new flashcard (cardID is "new")
      setCardToEdit([
        {
          front_text: "",
          back_text: "",
        },
      ]);
      setPageLoading(false); // New flashcard form is ready
    }
  }, [authLoading, loggedInSubject, routeSubject, cardID, router]); // Dependencies for useEffect

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
      // Consider a more user-friendly modal or toast instead of alert
      alert("Please ensure front text, back text, and grade are not empty.");
      setIsSaving(false);
      return;
    }

    const flashcardData = {
      front_text: cardToEdit[0].front_text,
      back_text: cardToEdit[0].back_text,
      grade: flashcardGrade,
      subject: loggedInSubject, // Use loggedInSubject which is verified
      unit: flashcardUnit,
      is_premium: isPremium,
    };

    let error = null;

    if (cardID === "new") {
      // Create new flashcard
      const { error: insertError } = await supabase
        .from("flashcards")
        .insert([flashcardData]);
      error = insertError;
    } else {
      // Update existing flashcard
      const { error: updateError } = await supabase
        .from("flashcards")
        .update(flashcardData)
        .eq("id", cardID);
      error = updateError;
    }

    if (error) {
      alert(`Failed to ${cardID === "new" ? "create" : "update"} flashcard.`);
      console.error(error);
    } else {
      alert(
        `Flashcard ${cardID === "new" ? "created" : "updated"} successfully!`
      );
      router.push(`/dashboard/${routeSubject}/flashcards`);
    }
    setIsSaving(false);
  };

  // Display loading state for both authentication and page content
  if (authLoading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Loading flashcard editor...</div>
      </div>
    );
  }

  // Fallback for unauthorized access or subject mismatch.
  // This should ideally be caught by the useEffect redirect,
  // but acts as a safeguard against rendering with invalid data.
  if (
    !loggedInSubject ||
    loggedInSubject.toLowerCase() !== routeSubject.toLowerCase()
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">
          Unauthorized access or subject mismatch.
        </div>
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
        <h1 className="text-3xl font-bold text-white">
          {cardID === "new" ? "Create New Flashcard" : "Edit Flashcard"}
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
          {isSaving
            ? "Saving..."
            : cardID === "new"
            ? "Create Flashcard"
            : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
