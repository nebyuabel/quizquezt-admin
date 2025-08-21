// app/dashboard/[subject]/questions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { Question } from "@/types/supabase";
import {
  ALL_GRADES,
  ALL_UNITS_DISPLAY,
  generateUnitFilter,
} from "@/lib/constants";
import { ConfirmationModal } from "@/components/ConfirmationModal";

export default function QuestionsPage({
  params,
}: {
  params: { subject: string };
}) {
  const { subject: loggedInSubject, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setDataLoading(true);

    let query = supabase
      .from("questions")
      .select("*")
      .ilike("subject", params.subject);

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
      query = query.ilike("question_text", `%${searchQuery}%`);
    }

    const { data, error } = await query
      .order("unit", { ascending: true })
      .order("created_at", { ascending: false });

    console.log("Supabase Query Response (actual data received):", {
      data,
      error,
    });

    if (error) {
      console.error("Error fetching questions:", error);
    } else {
      setQuestions(data || []);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (
      !loading &&
      loggedInSubject &&
      loggedInSubject.toLowerCase() === params.subject.toLowerCase()
    ) {
      fetchQuestions();
    }
  }, [
    loading,
    loggedInSubject,
    params.subject,
    selectedGrade,
    selectedUnit,
    searchQuery,
  ]);

  if (
    loading ||
    !loggedInSubject ||
    loggedInSubject.toLowerCase() !== params.subject.toLowerCase()
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Redirecting...</div>
      </div>
    );
  }

  const formattedSubject =
    loggedInSubject.charAt(0).toUpperCase() + loggedInSubject.slice(1);

  const handleDeleteClick = (questionId: string) => {
    setQuestionToDelete(questionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (questionToDelete) {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionToDelete);
      if (error) {
        alert("Failed to delete question.");
        console.error(error);
      } else {
        setQuestions(questions.filter((q) => q.id !== questionToDelete));
        alert("Question deleted successfully!");
      }
      setIsDeleteModalOpen(false);
      setQuestionToDelete(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        {/* Back Button to Subject Dashboard */}
        <div className="flex items-center">
          <button
            onClick={() => router.push(`/dashboard/${params.subject}`)}
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
            Manage {formattedSubject} Questions
          </h1>
        </div>
        <button
          onClick={() =>
            router.push(`/dashboard/${params.subject}/questions/new`)
          }
          className="px-6 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors"
        >
          Add New Questions
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
        <label className="text-gray-400">Search Question:</label>
        <input
          type="text"
          placeholder="Search question text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 flex-1 min-w-[200px]"
        />
      </div>

      {dataLoading ? (
        <p className="text-gray-400">Loading questions...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.length === 0 ? (
            <p className="text-gray-400">
              No questions found for this selection.
            </p>
          ) : (
            questions.map((question) => (
              <div
                key={question.id}
                className="relative p-6 bg-gray-800 rounded-lg shadow-md hover:ring-2 hover:ring-purple-500 transition-all"
              >
                <button
                  onClick={() => handleDeleteClick(question.id)}
                  className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-500 transition-colors z-10"
                  title="Delete Question"
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
                    router.push(
                      `/dashboard/${params.subject}/questions/${question.id}`
                    )
                  }
                  className="cursor-pointer"
                >
                  <h2 className="text-xl font-semibold mb-2 text-purple-300">
                    {question.question_text?.substring(0, 100)}
                    {question.question_text &&
                    question.question_text.length > 100
                      ? "..."
                      : ""}
                  </h2>
                  <ul className="list-disc list-inside text-gray-300 mb-2">
                    {question.options && Array.isArray(question.options) ? (
                      question.options.map((optionText, index) => (
                        <li
                          key={index}
                          className={`${
                            optionText === question.correct_answer
                              ? "text-green-400 font-bold"
                              : ""
                          }`}
                        >
                          {optionText}
                        </li>
                      ))
                    ) : (
                      <li className="text-red-400">
                        Error: Options format invalid.
                      </li>
                    )}
                  </ul>
                  <p className="text-sm text-gray-400">
                    <span className="font-bold">Grade:</span>{" "}
                    {question.grade || "N/A"} |{" "}
                    <span className="font-bold">Unit:</span>{" "}
                    {question.unit || "N/A"}
                  </p>
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
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
