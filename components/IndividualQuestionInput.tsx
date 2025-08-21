// components/IndividualQuestionInput.tsx
"use client";

import React, { useState, useEffect } from "react";
import { MinusCircle, PlusCircle } from "lucide-react";

interface Option {
  key: string; // e.g., 'a', 'b', 'c', 'd'
  text: string;
}

interface SingleQuestion {
  question_text: string;
  options: Option[]; // Changed to Option[]
  correct_answer: string; // Full text of correct option (e.g., "a. Option Text")
  id?: string; // Optional for existing questions
}

interface IndividualQuestionInputProps {
  initialQuestions?: SingleQuestion[]; // For editing existing sets
  onQuestionsChange: (questions: SingleQuestion[]) => void;
}

export const IndividualQuestionInput: React.FC<
  IndividualQuestionInputProps
> = ({ initialQuestions = [], onQuestionsChange }) => {
  // Helper to generate initial options in the correct format
  const createDefaultOptions = () => {
    return [
      { key: "a", text: "" },
      { key: "b", text: "" },
    ];
  };

  // Initialize state with initialQuestions or a single empty question
  const [questions, setQuestions] = useState<SingleQuestion[]>(() => {
    if (initialQuestions.length > 0) {
      return initialQuestions;
    }
    return [
      {
        question_text: "",
        options: createDefaultOptions(),
        correct_answer: "",
      },
    ];
  });

  const isInitialMount = React.useRef(true);

  useEffect(() => {
    // On subsequent renders, if initialQuestions change, update local state
    if (
      !isInitialMount.current &&
      initialQuestions.length > 0 &&
      JSON.stringify(initialQuestions) !== JSON.stringify(questions)
    ) {
      setQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  useEffect(() => {
    if (!isInitialMount.current) {
      // FIX: Changed onCardsChange to onQuestionsChange
      onQuestionsChange(questions);
    }
  }, [questions, onQuestionsChange]); // Dependency on onQuestionsChange is correct

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        options: createDefaultOptions(),
        correct_answer: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question_text = text;
    setQuestions(newQuestions);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const newQuestions = [...questions];
    const oldOption = newQuestions[qIndex].options[optIndex]; // Get the old option object

    newQuestions[qIndex].options[optIndex] = { ...oldOption, text: text };

    // If the edited option was the correct answer, update the correct answer text
    // The correct_answer stores the full formatted string (e.g., "a. Option Text")
    if (
      newQuestions[qIndex].correct_answer ===
      `${oldOption.key}. ${oldOption.text}`
    ) {
      newQuestions[qIndex].correct_answer = `${oldOption.key}. ${text}`;
    }

    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    // Generate new key (a, b, c, ...)
    const newKey = String.fromCharCode(
      97 + newQuestions[qIndex].options.length
    );
    newQuestions[qIndex].options.push({ key: newKey, text: "" });
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length > 2) {
      const removedOption = newQuestions[qIndex].options[optIndex];
      newQuestions[qIndex].options.splice(optIndex, 1);

      // If the removed option was the correct answer, clear it
      if (
        newQuestions[qIndex].correct_answer ===
        `${removedOption.key}. ${removedOption.text}`
      ) {
        newQuestions[qIndex].correct_answer = "";
      }

      // Re-key remaining options to maintain 'a', 'b', 'c' order
      newQuestions[qIndex].options = newQuestions[qIndex].options.map(
        (opt, idx) => ({
          key: String.fromCharCode(97 + idx),
          text: opt.text,
        })
      );

      setQuestions(newQuestions);
    }
  };

  const setCorrectAnswer = (qIndex: number, option: Option) => {
    const newQuestions = [...questions];
    // correct_answer stores the full formatted string, e.g., "a. Option Text"
    newQuestions[qIndex].correct_answer = `${option.key}. ${option.text}`;
    setQuestions(newQuestions);
  };

  // Helper to get the display label for an option (e.g., "A.")
  const getDisplayOptionLabel = (option: Option) =>
    `${option.key.toUpperCase()}.`;

  return (
    <div className="space-y-6">
      {questions.map((question, qIndex) => (
        <div
          key={question.id || qIndex}
          className="p-4 bg-gray-700 rounded-lg shadow-inner border border-gray-600"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Question {qIndex + 1}
            </h3>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-400 hover:text-red-500 transition-colors"
              >
                <MinusCircle size={24} />
              </button>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor={`question_text_${qIndex}`}
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Question Text
            </label>
            <textarea
              id={`question_text_${qIndex}`}
              value={question.question_text}
              onChange={(e) => updateQuestionText(qIndex, e.target.value)}
              placeholder="e.g., What is the capital of France?"
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-4">
            <h4 className="text-base font-medium text-gray-400 mb-2">
              Options:
            </h4>
            {question.options.map(
              (
                option,
                optIndex // option is now { key: string, text: string }
              ) => (
                <div key={option.key} className="flex items-center mb-2">
                  <input
                    type="radio"
                    name={`correct_answer_${qIndex}`}
                    value={`${option.key}. ${option.text}`} // Radio value is the full formatted text
                    checked={
                      question.correct_answer ===
                      `${option.key}. ${option.text}`
                    }
                    onChange={() => setCorrectAnswer(qIndex, option)} // Pass the whole option object
                    className="form-radio h-4 w-4 text-purple-600 mr-2 border-gray-500 bg-gray-600"
                  />
                  <label
                    htmlFor={`option_input_${qIndex}_${option.key}`}
                    className="text-gray-300 mr-2"
                  >
                    {getDisplayOptionLabel(option)}
                  </label>
                  <input
                    id={`option_input_${qIndex}_${option.key}`} // Unique ID using option.key
                    type="text"
                    value={option.text} // Input directly controls option.text
                    onChange={(e) =>
                      updateOptionText(qIndex, optIndex, e.target.value)
                    }
                    placeholder={`Option ${getDisplayOptionLabel(option)}`}
                    className="flex-1 px-3 py-1 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, optIndex)}
                      className="ml-2 text-red-400 hover:text-red-500 transition-colors"
                    >
                      <MinusCircle size={20} />
                    </button>
                  )}
                </div>
              )
            )}
            {question.options.length < 5 && ( // Limit to 5 options (a-e)
              <button
                type="button"
                onClick={() => addOption(qIndex)}
                className="mt-2 text-purple-400 hover:text-purple-500 flex items-center"
              >
                <PlusCircle size={20} className="mr-1" /> Add Option
              </button>
            )}
          </div>
        </div>
      ))}
      {/* For editing a single question, don't show "Add Another" if there's an initial question */}
      {initialQuestions.length === 0 && (
        <button
          type="button"
          onClick={addQuestion}
          className="w-full flex items-center justify-center px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
        >
          <PlusCircle size={20} className="mr-2" /> Add Another Question
        </button>
      )}
    </div>
  );
};
