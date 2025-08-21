// app/dashboard/[subject]/questions/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { ALL_GRADES, ALL_UNITS_DISPLAY } from "@/lib/constants";
import { IndividualQuestionInput } from "@/components/IndividualQuestionInput";

// Dynamically import the BulkQuestionEditor with SSR disabled
const BulkQuestionEditor = dynamic(
  () =>
    import("@/components/BulkQuestionEditor").then(
      (mod) => mod.BulkQuestionEditor
    ),
  { ssr: false }
);

interface Option {
  key: string; // e.g., 'a', 'b', 'c', 'd'
  text: string;
}

// Define the structure of a parsed question for new entries, now with Option[]
interface ParsedQuestion {
  question_text: string;
  options: Option[]; // Array of Option objects (key and text)
  correct_answer: string; // Full text of correct option (e.g., "a. Option Text")
}

export default function NewQuestionPage({
  params,
}: {
  params: { subject: string };
}) {
  const { subject: loggedInSubject, loading } = useAuth();
  const router = useRouter();

  const [questionGrade, setQuestionGrade] = useState("");
  const [questionUnit, setQuestionUnit] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [inputMode, setInputMode] = useState<"individual" | "bulk">(
    "individual"
  );

  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
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

  // IndividualQuestionInput's onQuestionsChange expects ParsedQuestion[] (which has Option[])
  const handleIndividualQuestionsChange = (questions: ParsedQuestion[]) => {
    setParsedQuestions(questions);
  };

  // BulkQuestionEditor's onContentChange expects ParsedQuestion[] (which has Option[])
  const handleBulkEditorChange = (
    questions: ParsedQuestion[],
    rawHtml: string
  ) => {
    setParsedQuestions(questions);
    setBulkEditorContent(rawHtml);
  };

  const handleSaveQuestions = async () => {
    setIsSaving(true);
    if (
      !questionGrade ||
      parsedQuestions.length === 0 ||
      parsedQuestions.some(
        (q) => !q.question_text || q.options.length === 0 || !q.correct_answer
      )
    ) {
      alert(
        "Please select a grade and ensure all questions have text, options, and a correct answer."
      );
      setIsSaving(false);
      return;
    }

    // Transform options to string[] for Supabase
    const questionsToInsert = parsedQuestions.map((q) => ({
      question_text: q.question_text,
      options: q.options.map((opt) => `${opt.key}. ${opt.text}`), // Convert Option[] to string[]
      correct_answer: q.correct_answer,
      grade: questionGrade,
      subject: loggedInSubject,
      unit: questionUnit,
    }));

    const { error } = await supabase
      .from("questions")
      .insert(questionsToInsert);

    if (error) {
      alert("Failed to save questions.");
      console.error(error);
    } else {
      alert("Questions created successfully!");
      router.push(`/dashboard/${subject}/questions`);
    }
    setIsSaving(false);
  };

  return (
    <div className="p-8 min-h-screen flex flex-col">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push(`/dashboard/${subject}/questions`)}
          className="mr-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          title="Go back to Questions"
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
          Create New Questions for {subject}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <select
          value={questionGrade}
          onChange={(e) => setQuestionGrade(e.target.value)}
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
          value={questionUnit}
          onChange={(e) => setQuestionUnit(e.target.value)}
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

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setInputMode("individual")}
          className={`px-6 py-3 rounded-l-md font-semibold transition-colors ${
            inputMode === "individual"
              ? "bg-purple-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Individual Questions
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
          <IndividualQuestionInput
            onQuestionsChange={handleIndividualQuestionsChange}
          />
        ) : (
          <BulkQuestionEditor
            initialContent={bulkEditorContent}
            onContentChange={handleBulkEditorChange}
          />
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-auto">
        <button
          onClick={() => router.push(`/dashboard/${subject}/questions`)}
          className="px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveQuestions}
          disabled={
            isSaving ||
            parsedQuestions.length === 0 ||
            parsedQuestions.some(
              (q) =>
                !q.question_text || q.options.length === 0 || !q.correct_answer
            )
          }
          className="px-6 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Questions"}
        </button>
      </div>
    </div>
  );
}
