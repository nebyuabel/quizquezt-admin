// components/EditorToolbar.tsx
"use client"; // This component must be a client component

import React from "react";
import { Editor } from "@tiptap/react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap p-2 bg-gray-700 border-b border-gray-600 space-x-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("bold")
            ? "bg-purple-600 text-white"
            : "hover:bg-gray-600 text-gray-300"
        }`}
      >
        <span className="font-bold">B</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("italic")
            ? "bg-purple-600 text-white"
            : "hover:bg-gray-600 text-gray-300"
        }`}
      >
        <span className="italic">I</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("heading", { level: 1 })
            ? "bg-purple-600 text-white"
            : "hover:bg-gray-600 text-gray-300"
        }`}
      >
        <span className="font-bold text-xl">H1</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("heading", { level: 2 })
            ? "bg-purple-600 text-white"
            : "hover:bg-gray-600 text-gray-300"
        }`}
      >
        <span className="font-bold text-lg">H2</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("bulletList")
            ? "bg-purple-600 text-white"
            : "hover:bg-gray-600 text-gray-300"
        }`}
      >
        <span className="text-xl">•</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-md transition-colors ${
          editor.isActive("orderedList")
            ? "bg-purple-600 text-white"
            : "hover:bg-gray-600 text-gray-300"
        }`}
      >
        <span className="text-xl">1.</span>
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded-md hover:bg-gray-600 text-gray-300"
      >
        Undo
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded-md hover:bg-gray-600 text-gray-300"
      >
        Redo
      </button>
    </div>
  );
};
