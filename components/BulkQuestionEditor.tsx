// components/BulkQuestionEditor.tsx
"use client";

import React, { useEffect } from "react";
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
  key: string;
  text: string;
}

export interface ParsedQuestion {
  question_text: string;
  options: Option[];
  correct_answer: string; // "a. Option text"
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
        placeholder: `Paste or type MCQs here.

Format:
Q: Your question text
a. first option
b. second option <
c. third option
d. fourth option
---
Q: Next question...
a. ...
b. ... <
c. ...
d. ...

Tips:
• Use "<" at the END of the correct option line.
• Use "---" on a line by itself to separate questions.
• You can also start questions with "Question:" or "1." instead of "Q:".
`,
      }),
      CharacterCount.configure({ limit: MAX_NOTE_LENGTH * 5 }),
      QuestionSeparatorExtension,
      CorrectAnswerMark,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const rawHtml = editor.getHTML();
      const textContent = editor.getText();

      // Normalize newlines and trim trailing spaces
      const lines = textContent
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((l) => l.replace(/\s+$/g, ""));

      const parsedQuestions: ParsedQuestion[] = [];

      let current: ParsedQuestion | null = null;
      let expectingOptions = false;

      const flushIfValid = () => {
        if (
          current &&
          current.question_text.trim().length > 0 &&
          current.options.length > 0 &&
          current.correct_answer.trim().length > 0
        ) {
          parsedQuestions.push(current);
        }
        current = null;
        expectingOptions = false;
      };

      for (const rawLine of lines) {
        const line = rawLine.trim();

        if (line === "") continue;

        // Block separator
        if (line === "---") {
          flushIfValid();
          continue;
        }

        // New question detectors
        const qMatch = line.match(/^(Q:|Question:|\d+\.)\s*(.*)$/i);
        if (qMatch) {
          // if an unfinished question existed, push only if valid
          flushIfValid();
          current = {
            question_text: (qMatch[2] || "").trim(),
            options: [],
            correct_answer: "",
          };
          expectingOptions = true;
          continue;
        }

        // If we're inside a question, try to parse options
        if (current && expectingOptions) {
          // allow a–z prefix but typically a–d
          const optMatch = line.match(/^([a-zA-Z])[\.:]?\s+(.*)$/);
          if (optMatch) {
            const key = optMatch[1].toLowerCase();
            let text = optMatch[2].trim();

            // Correct marker "<" at end
            if (text.endsWith("<")) {
              text = text.slice(0, -1).trim();
              current.correct_answer = `${key}. ${text}`;
            }

            current.options.push({ key, text });
            continue;
          }

          // If it's not an option line, treat as question text continuation
          current.question_text = `${current.question_text}\n${line}`.trim();
          continue;
        }

        // If we haven't created current yet but text started without Q:, treat as question text start
        if (!current) {
          current = {
            question_text: line,
            options: [],
            correct_answer: "",
          };
          expectingOptions = true; // next lines should be options
          continue;
        }

        // Otherwise, append to question text
        current.question_text = `${current.question_text}\n${line}`.trim();
      }

      // final flush
      flushIfValid();

      onContentChange(parsedQuestions, rawHtml);
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
        opacity: 0.7;
        background: rgba(34,197,94,0.08); /* subtle green bg */
        border-radius: 0.375rem;
        padding: 0.1rem 0.2rem;
        transition: opacity 0.2s ease-in-out, background 0.2s ease-in-out;
      }
      .ProseMirror .correct-answer-indicator.ProseMirror-selectednode,
      .ProseMirror .correct-answer-indicator.ProseMirror-textselection,
      .ProseMirror .correct-answer-indicator:hover {
        opacity: 1;
        background: rgba(34,197,94,0.15);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="border border-gray-600 rounded-md overflow-hidden bg-gray-900 text-gray-100">
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
