// app/dashboard/[subject]/questions/[questionID]/page.tsx
"use client";

import { useState, useEffect } from "react"; // 'use' removed
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { Question } from "@/types/supabase";
import { ALL_GRADES, ALL_UNITS_DISPLAY } from "@/lib/constants";
import { IndividualQuestionInput } from "@/components/IndividualQuestionInput";

interface Option {
  key: string;
  text: string;
}

interface SingleQuestionForInput {
  question_text: string;
  options: Option[];
  correct_answer: string;
  id?: string;
}

// FIX: Access params directly, remove React.use()
export default function EditQuestionPage({
  params,
}: {
  params: { subject: string; questionID: string };
}) {
  const { subject: routeSubject, questionID } = params; // Direct access

  const { subject: loggedInSubject, loading } = useAuth();
  const router = useRouter();

  const [questionGrade, setQuestionGrade] = useState("");
  const [questionUnit, setQuestionUnit] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [questionToEdit, setQuestionToEdit] = useState<
    SingleQuestionForInput[]
  >([]);

  useEffect(() => {
    if (
      questionID !== "new" &&
      !loading &&
      loggedInSubject &&
      loggedInSubject.toLowerCase() === routeSubject.toLowerCase()
    ) {
      const fetchQuestion = async () => {
        setPageLoading(true);
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("id", questionID)
          .single();

        if (error || !data) {
          console.error("Error fetching question:", error);
          alert("Question not found or an error occurred.");
          router.push(`/dashboard/${routeSubject}/questions`);
        } else {
          setQuestionGrade(data.grade || "");
          setQuestionUnit(data.unit || "");

          const transformedOptions: Option[] = (data.options || []).map(
            (opt: string) => {
              const match = opt.match(/^([a-zA-Z])[\.:]?\s*(.*)/);
              if (match) {
                return {
                  key: match[1].toLowerCase(),
                  text: match[2].trim(),
                };
              }
              return { key: "", text: opt || "" };
            }
          );

          setQuestionToEdit([
            {
              id: data.id,
              question_text: data.question_text || "",
              options: transformedOptions,
              correct_answer: data.correct_answer || "",
            },
          ]);
        }
        setPageLoading(false);
      };
      fetchQuestion();
    } else {
      router.push(`/dashboard/${routeSubject}/questions/new`);
    }
  }, [questionID, loading, loggedInSubject, routeSubject, router]);

  const handleIndividualQuestionsChange = (
    questions: SingleQuestionForInput[]
  ) => {
    if (questions.length > 0) {
      setQuestionToEdit([questions[0]]);
    } else {
      setQuestionToEdit([]);
    }
  };

  const handleSaveQuestion = async () => {
    setIsSaving(true);
    if (
      questionToEdit.length === 0 ||
      !questionToEdit[0].question_text ||
      questionToEdit[0].options.length === 0 ||
      !questionToEdit[0].correct_answer ||
      !questionGrade
    ) {
      alert(
        "Please ensure question text, options, correct answer, and grade are not empty."
      );
      setIsSaving(false);
      return;
    }

    const optionsForSupabase = questionToEdit[0].options.map(
      (opt) => `${opt.key}. ${opt.text}`
    );

    const updatedQuestion = {
      question_text: questionToEdit[0].question_text,
      options: optionsForSupabase,
      correct_answer: questionToEdit[0].correct_answer,
      grade: questionGrade,
      subject: loggedInSubject,
      unit: questionUnit,
    };

    const { error } = await supabase
      .from("questions")
      .update(updatedQuestion)
      .eq("id", questionID);

    if (error) {
      alert("Failed to update question.");
      console.error(error);
    } else {
      alert("Question updated successfully!");
      router.push(`/dashboard/${routeSubject}/questions`);
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
        <div className="text-white text-lg">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen flex flex-col">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push(`/dashboard/${routeSubject}/questions`)}
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
        <h1 className="text-3xl font-bold text-white">Edit Question</h1>
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
          value={questionUnit || ""}
          onChange={(e) => setQuestionUnit(e.target.value || "")}
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

      <div className="flex-1 mb-6">
        <IndividualQuestionInput
          initialQuestions={questionToEdit}
          onQuestionsChange={handleIndividualQuestionsChange}
        />
      </div>

      <div className="flex justify-end space-x-4 mt-auto">
        <button
          onClick={() => router.push(`/dashboard/${routeSubject}/questions`)}
          className="px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveQuestion}
          disabled={
            isSaving ||
            questionToEdit.length === 0 ||
            !questionToEdit[0].question_text ||
            questionToEdit[0].options.length === 0 ||
            !questionToEdit[0].correct_answer ||
            !questionGrade
          }
          className="px-6 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
