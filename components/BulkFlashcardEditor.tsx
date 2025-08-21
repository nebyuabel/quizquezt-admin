// components/BulkFlashcardEditor.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorToolbar } from "./EditorToolBar";
import { MAX_NOTE_LENGTH } from "@/lib/constants";

import { FlashcardSeparatorExtension } from "@/lib/tiptap-extensions/FlashcardSeparatorExtension";

type EditorWithCount = Editor & { getCharacterCount?: () => number };

// ParsedFlashcard type for this component, does NOT include is_premium
interface ParsedFlashcard {
  front_text: string;
  back_text: string;
}

interface BulkFlashcardEditorProps {
  initialContent: string;
  onContentChange: (parsedCards: ParsedFlashcard[], rawHtml: string) => void; // Expects array of ParsedFlashcard
}

export const BulkFlashcardEditor: React.FC<BulkFlashcardEditorProps> = ({
  initialContent,
  onContentChange,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: `Enter flashcards here. Use ">>" or "::" to separate front from back.\n\nExample:\nFront text of card 1 >> Back text of card 1\nFront text of card 2 :: Back text of card 2`,
      }),
      CharacterCount.configure({
        limit: MAX_NOTE_LENGTH * 5,
      }),
      FlashcardSeparatorExtension,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const rawHtml = editor.getHTML();
      const textContent = editor.getText();

      const lines = textContent.split("\n");
      const parsedCards: ParsedFlashcard[] = [];

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const separatorIndex = trimmedLine.indexOf(" >>");
        const altSeparatorIndex = trimmedLine.indexOf(" ::");

        if (separatorIndex !== -1 || altSeparatorIndex !== -1) {
          const splitIndex =
            separatorIndex !== -1 ? separatorIndex : altSeparatorIndex;
          const front_text = trimmedLine.substring(0, splitIndex).trim();
          const back_text = trimmedLine.substring(splitIndex + 3).trim(); // +3 for ' >>' or ' ::'

          if (front_text && back_text) {
            parsedCards.push({ front_text, back_text });
          }
        }
      });
      onContentChange(parsedCards, rawHtml);
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
