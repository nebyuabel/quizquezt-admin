// components/EditorToolBar.tsx
"use client";

import React from "react";
import { Editor } from "@tiptap/react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  const Btn: React.FC<{
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    label: React.ReactNode;
  }> = ({ active, disabled, onClick, label }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 rounded-md transition-colors ${
        active ? "bg-purple-600 text-white" : "hover:bg-gray-700 text-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label={<span className="font-bold">B</span>}
      />
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label={<span className="italic">I</span>}
      />
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
        }
        active={editor.isActive("heading", { level: 1 })}
        label={<span className="font-bold text-lg">H1</span>}
      />
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
        }
        active={editor.isActive("heading", { level: 2 })}
        label={<span className="font-bold">H2</span>}
      />
      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label={<span>• List</span>}
      />
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label={<span>1. List</span>}
      />
      <div className="ml-auto text-xs text-gray-400">
        Tip: type <code className="bg-gray-700 px-1 rounded">---</code> to
        separate blocks
      </div>
    </div>
  );
};
