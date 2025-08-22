// lib/tiptap-extensions/FlashcardSeparatorExtension.ts

import { Extension } from "@tiptap/core";
import { InputRule } from "@tiptap/core";

export const FlashcardSeparatorExtension = Extension.create({
  name: "flashcardSeparator",

  addInputRules() {
    return [
      new InputRule({
        find: />>/, // Finds ">>"
        handler: ({ state, range, commands }) => {
          const { tr } = state;
          const start = range.from;
          const end = range.to;

          // Replace ">>" with " ↓ " and move cursor to the next line
          tr.insertText(" ↓ ", start, end);
          commands.setTextSelection(start + 3); // Move cursor after the inserted text
          commands.splitBlock(); // Create a new block (new line)
          commands.insertContent(""); // Insert empty content
          commands.scrollIntoView(); // Scroll to the new position
          return; // FIX: Explicitly return void
        },
      }),
      new InputRule({
        find: /::/, // Finds "::"
        handler: ({ state, range, commands }) => {
          const { tr } = state;
          const start = range.from;
          const end = range.to;

          // Replace "::" with " ↓ " and move cursor to the next line
          tr.insertText(" ↓ ", start, end);
          commands.setTextSelection(start + 3); // Move cursor after the inserted text
          commands.splitBlock(); // Create a new block (new line)
          commands.insertContent(""); // Insert empty content
          commands.scrollIntoView(); // Scroll to the new position
          return; // FIX: Explicitly return void
        },
      }),
    ];
  },
});
