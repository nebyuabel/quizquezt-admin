// lib/tiptap-extensions/FlashcardSeparatorExtension.ts
import { Extension, InputRule } from "@tiptap/core";

export const FlashcardSeparatorExtension = Extension.create({
  name: "flashcardSeparator",

  addInputRules() {
    // When user types >> or ::, replace with " ↓ " and split to next line
    return [
      new InputRule({
        find: /\s?>>\s?$/, // at end of line
        handler: ({ state, range, commands }) => {
          const { tr } = state;
          const start = range.from;
          const end = range.to;

          tr.insertText(" ↓", start, end);
          commands.setTextSelection(start + 2);
          commands.splitBlock();
          commands.scrollIntoView();
        },
      }),
      new InputRule({
        find: /\s?::\s?$/, // at end of line
        handler: ({ state, range, commands }) => {
          const { tr } = state;
          const start = range.from;
          const end = range.to;

          tr.insertText(" ↓", start, end);
          commands.setTextSelection(start + 2);
          commands.splitBlock();
          commands.scrollIntoView();
        },
      }),
    ];
  },
});
