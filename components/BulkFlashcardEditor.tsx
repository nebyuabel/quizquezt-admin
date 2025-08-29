// components/BulkFlashcardEditor.tsx
"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorToolbar } from "./EditorToolBar";
import { MAX_NOTE_LENGTH } from "@/lib/constants";
import { FlashcardSeparatorExtension } from "@/lib/tiptap-extensions/FlashcardSeparatorExtension";

type EditorWithCount = Editor & { getCharacterCount?: () => number };

export interface ParsedFlashcard {
  front_text: string;
  back_text: string;
}

interface BulkFlashcardEditorProps {
  initialContent: string;
  onContentChange: (parsedCards: ParsedFlashcard[], rawHtml: string) => void;
}

export const BulkFlashcardEditor: React.FC<BulkFlashcardEditorProps> = ({
  initialContent,
  onContentChange,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: `Enter flashcards here.

Formats:
Front >> Back
Front :: Back
(When you type >> or :: it turns into " ↓ " and jumps to a new line.)

You can separate cards with a line containing just:
---
`,
      }),
      CharacterCount.configure({ limit: MAX_NOTE_LENGTH * 5 }),
      FlashcardSeparatorExtension,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const rawHtml = editor.getHTML();
      const textContent = editor.getText();

      const lines = textContent.replace(/\r\n?/g, "\n").split("\n");

      const cards: ParsedFlashcard[] = [];

      let currentFront: string | null = null;
      let currentBack: string[] = [];

      const flushIfValid = () => {
        if (currentFront && currentFront.trim() && currentBack.length > 0) {
          const back = currentBack.join("\n").trim();
          if (back) {
            cards.push({
              front_text: currentFront.trim(),
              back_text: back,
            });
          }
        }
        currentFront = null;
        currentBack = [];
      };

      for (const rawLine of lines) {
        const line = rawLine.replace(/\s+$/g, "");

        if (line.trim() === "") continue;

        // Card separator
        if (line.trim() === "---") {
          flushIfValid();
          continue;
        }

        // Single-line separators " >>" / " ::" (space optional)
        // and the converted "↓" marker (placed by input rule)
        const arrowIdx = line.indexOf(">>");
        const colonIdx = line.indexOf("::");
        const downIdx = line.indexOf("↓"); // our inserted symbol

        const hasInlineSplit =
          arrowIdx !== -1 || colonIdx !== -1 || downIdx !== -1;

        if (hasInlineSplit) {
          // New card starts; flush previous
          flushIfValid();

          let idx = -1;
          let sepLen = 2;

          if (downIdx !== -1) {
            idx = downIdx;
            // could be surrounded by spaces, trim them out from both sides later
            sepLen = 1;
          } else if (arrowIdx !== -1) {
            idx = arrowIdx;
            sepLen = 2;
          } else if (colonIdx !== -1) {
            idx = colonIdx;
            sepLen = 2;
          }

          const front = line.slice(0, idx).trim();
          // +sepLen plus potential trailing space
          const after = line.slice(idx + sepLen).replace(/^\s+/, "");

          currentFront = front;
          // If the input rule split to the next line, back content
          // will come from subsequent lines; but if user kept same line,
          // we capture the rest as the beginning of back.
          currentBack = after ? [after] : [];
          continue;
        }

        // If we already have a front, keep adding to back until separator
        if (currentFront) {
          currentBack.push(line);
          continue;
        }

        // If none matched, treat this line as a single-line card with no explicit sep
        // (we won't create a card until we see a separator)
        // To keep behavior strict & predictable, ignore orphan lines.
      }

      // final flush
      flushIfValid();

      onContentChange(cards, rawHtml);
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
