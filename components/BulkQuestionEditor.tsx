// components/BulkQuestionEditor.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorToolbar } from "./EditorToolBar";
import { MAX_NOTE_LENGTH } from "@/lib/constants";

import {
  QuestionSeparatorExtension,
  CorrectAnswerMark,
} from "@/lib/tiptap-extensions/QuestionSeparatorExtension";

type EditorWithCount = Editor & { getCharacterCount?: () => number };

interface Option {
  // Define Option here as well for local use
  key: string;
  text: string;
}

interface ParsedQuestion {
  question_text: string;
  options: Option[]; // Expects array of Option objects
  correct_answer: string; // Full text of correct option (e.g., "a. Option Text")
}

interface BulkQuestionEditorProps {
  initialContent: string;
  onContentChange: (parsedQuestions: ParsedQuestion[], rawHtml: string) => void;
}

export const BulkQuestionEditor: React.FC<BulkQuestionEditorProps> = ({
  initialContent,
  onContentChange,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: `Paste your questions here directly from Gemini or type them.
Each question block should start on a new line.

Use ">>" or "::" to separate the question from its options. This will turn into " ↓" and move to a new line.

Type options starting with "a.", "b.", etc., on new lines.
Mark the correct answer with "<" or "*" at the end of its line. This will remove the marker and apply a faint style.

Example:
/n What is the capital of France? >>
a. London
b. Berlin
c. Paris <
d. Rome

2. Which planet is known as the Red Planet? ::
a. Earth
b. Mars *
c. Jupiter
d. Venus`,
      }),
      CharacterCount.configure({
        limit: MAX_NOTE_LENGTH * 5,
      }),
      QuestionSeparatorExtension,
      CorrectAnswerMark,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const rawHtml = editor.getHTML();
      const textContent = editor.getText();

      const lines = textContent.split("\n");
      const parsedQuestions: ParsedQuestion[] = [];
      let currentQuestion: ParsedQuestion | null = null;
      let expectingOptions = false;

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          if (
            currentQuestion &&
            currentQuestion.question_text &&
            currentQuestion.options.length > 0 &&
            currentQuestion.correct_answer
          ) {
            parsedQuestions.push(currentQuestion);
            currentQuestion = null;
            expectingOptions = false;
          }
          return;
        }

        const separatorMatch = trimmedLine.match(/(.*)\s↓$/);
        const isNewQuestionMarker = trimmedLine.match(/^\/(?:n|N)\s*(.*)/);
        const questionPrefixMatch = trimmedLine.match(
          /^(Question:|\d+\.)\s*(.*)/i
        );

        const startsNewQuestionBlock =
          isNewQuestionMarker ||
          (questionPrefixMatch && !expectingOptions) ||
          (separatorMatch && !currentQuestion);

        if (startsNewQuestionBlock) {
          if (
            currentQuestion &&
            currentQuestion.question_text &&
            currentQuestion.options.length > 0 &&
            currentQuestion.correct_answer
          ) {
            parsedQuestions.push(currentQuestion);
          }

          let questionText = trimmedLine;
          if (isNewQuestionMarker) {
            questionText = isNewQuestionMarker[1].trim();
          } else if (questionPrefixMatch) {
            questionText = questionPrefixMatch[2].trim();
          } else if (separatorMatch) {
            questionText = separatorMatch[1].trim();
          }
          questionText = questionText
            .replace(/^(Question:|\d+\.)\s*/i, "")
            .trim();

          currentQuestion = {
            question_text: questionText,
            options: [],
            correct_answer: "",
          };
          expectingOptions = !!separatorMatch;
        } else if (
          currentQuestion &&
          (expectingOptions || trimmedLine.match(/^([a-zA-Z][\.:]?)\s*(.*)/i))
        ) {
          const optionMatch = trimmedLine.match(/^([a-zA-Z][\.:]?)\s*(.*)/i);

          if (optionMatch) {
            // FIX: Changed 'let' to 'const' for optionPrefix
            const optionPrefix = optionMatch[1]
              .replace(/[\.:]/g, "")
              .trim()
              .toLowerCase();
            let optionTextContent = optionMatch[2].trim();

            const correctAnswerMatch =
              optionTextContent.match(/(.*)(\s*<|\s*\*)$/);
            if (correctAnswerMatch) {
              optionTextContent = correctAnswerMatch[1].trim();
              currentQuestion.correct_answer = `${optionPrefix}. ${optionTextContent}`;
            }

            currentQuestion.options.push({
              key: optionPrefix,
              text: optionTextContent,
            });
            expectingOptions = true;
          } else if (currentQuestion.options.length === 0) {
            currentQuestion.question_text += `\n${trimmedLine}`;
          } else {
            const lastOption =
              currentQuestion.options[currentQuestion.options.length - 1];
            currentQuestion.options[currentQuestion.options.length - 1] = {
              ...lastOption,
              text: `${lastOption.text}\n${trimmedLine}`,
            };
          }
        } else if (currentQuestion) {
          currentQuestion.question_text += `\n${trimmedLine}`;
        }
      });

      if (
        currentQuestion &&
        currentQuestion.question_text &&
        currentQuestion.options.length > 0 &&
        currentQuestion.correct_answer
      ) {
        parsedQuestions.push(currentQuestion);
      }

      const finalParsedQuestions = parsedQuestions.filter(
        (q) => q.question_text && q.options.length > 0 && q.correct_answer
      );

      onContentChange(finalParsedQuestions, rawHtml);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none",
      },
    },
    immediatelyRender: false,
  }) as EditorWithCount | null;

  useEffect(() => {
    if (editor) {
      const currentEditorHTML = editor.getHTML();
      if (initialContent !== currentEditorHTML) {
        editor.commands.setContent(initialContent, { emitUpdate: true });
      } else if (!initialContent && currentEditorHTML !== "") {
        editor.commands.setContent("", { emitUpdate: true });
      } else if (initialContent === "" && currentEditorHTML === "") {
        onContentChange([], "");
      }
    }
  }, [editor, initialContent, onContentChange]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .correct-answer-indicator {
        opacity: 0.5;
        transition: opacity 0.2s ease-in-out;
      }
      .ProseMirror .correct-answer-indicator.ProseMirror-selectednode,
      .ProseMirror .correct-answer-indicator.ProseMirror-textselection,
      .ProseMirror .correct-answer-indicator:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="border border-gray-600 rounded-md overflow-hidden bg-gray-800 text-white">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="p-4 min-h-[400px]" />
      <div className="flex justify-end p-2 text-gray-400 text-sm">
        {editor && editor.getCharacterCount ? (
          <div>
            {editor.getCharacterCount()}/{MAX_NOTE_LENGTH * 5} characters
          </div>
        ) : (
          "Character count unavailable"
        )}
      </div>
    </div>
  );
};
