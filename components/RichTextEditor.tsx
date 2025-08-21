// components/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback } from "react";

const RichTextEditor = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (newContent: string) => void;
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      // Send the updated content back to the parent component as HTML
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none p-4 min-h-[300px] border border-gray-600 rounded-lg bg-gray-800 text-white",
      },
    },
  });

  const toggleHeading = useCallback(
    (level: 1 | 2 | 3 | 4 | 5 | 6) => {
      if (editor) {
        editor.chain().focus().toggleHeading({ level }).run();
      }
    },
    [editor]
  );

  const toggleBold = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBold().run();
    }
  }, [editor]);

  const toggleItalic = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleItalic().run();
    }
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBulletList().run();
    }
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleOrderedList().run();
    }
  }, [editor]);

  return (
    <div className="flex flex-col rounded-lg overflow-hidden">
      <div className="flex flex-wrap p-2 bg-gray-700 border-b border-gray-600">
        <button
          onClick={() => toggleBold()}
          className="p-2 rounded-md hover:bg-gray-600"
        >
          <span className="font-bold">B</span>
        </button>
        <button
          onClick={() => toggleItalic()}
          className="p-2 rounded-md hover:bg-gray-600"
        >
          <span className="italic">I</span>
        </button>
        <button
          onClick={() => toggleHeading(1)}
          className="p-2 rounded-md hover:bg-gray-600"
        >
          <span className="font-bold text-xl">H1</span>
        </button>
        <button
          onClick={() => toggleHeading(2)}
          className="p-2 rounded-md hover:bg-gray-600"
        >
          <span className="font-bold text-lg">H2</span>
        </button>
        <button
          onClick={() => toggleBulletList()}
          className="p-2 rounded-md hover:bg-gray-600"
        >
          <span className="text-xl">•</span>
        </button>
        <button
          onClick={() => toggleOrderedList()}
          className="p-2 rounded-md hover:bg-gray-600"
        >
          <span className="text-xl">1.</span>
        </button>
      </div>
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
};

export default RichTextEditor;
