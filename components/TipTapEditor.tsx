// components/TiptapEditor.tsx
"use client";

import React from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorToolbar } from "./EditorToolBar";
import { MAX_NOTE_LENGTH } from "@/lib/constants";

// This type assertion is to help TypeScript, but doesn't fix runtime issues
type EditorWithCount = Editor & { getCharacterCount?: () => number }; // Make it optional now

interface TiptapEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
}

export function TiptapEditor({
  initialContent,
  onContentChange,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your notes here...",
      }),
      // Ensure CharacterCount is still configured here
      CharacterCount.configure({
        limit: MAX_NOTE_LENGTH,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none",
      },
    },
    immediatelyRender: false,
  }) as EditorWithCount | null; // Cast the result

  return (
    <div className="border border-gray-600 rounded-md overflow-hidden bg-gray-800 text-white">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="p-4 min-h-[300px]" />
      <div className="flex justify-end p-2 text-gray-400 text-sm">
        {editor && (
          <div>
            {/* *** THE WORKAROUND: Conditionally call getCharacterCount *** */}
            {editor.getCharacterCount
              ? `${editor.getCharacterCount()}/${MAX_NOTE_LENGTH} characters`
              : "Character count unavailable"}
          </div>
        )}
      </div>
    </div>
  );
}
