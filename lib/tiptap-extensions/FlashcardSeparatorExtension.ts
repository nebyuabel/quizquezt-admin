// lib/tiptap-extensions/FlashcardSeparatorExtension.ts

import { Extension, Mark } from "@tiptap/core"; // Import Mark from @tiptap/core
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import { InputRule } from "@tiptap/core"; // Import InputRule from @tiptap/core

// Define a custom mark for back_text to style it faintly
// This is now a proper Tiptap Mark extension
export const BackTextMark = Mark.create({
  name: "backText",

  // No attributes needed for now, just the mark itself
  addAttributes() {
    return {};
  },

  // How to parse HTML when loading content into the editor
  parseHTML() {
    return [
      {
        tag: "span",
        // Check if the span has the 'back-text' class
        getAttrs: (node: HTMLElement) =>
          node.classList.contains("back-text") ? {} : false,
      },
    ];
  },

  // How to render HTML when exporting content from the editor
  renderHTML({ HTMLAttributes }) {
    // Explicitly type HTMLAttributes
    return ["span", { class: "back-text", ...HTMLAttributes }, 0];
  },
});

export const FlashcardSeparatorExtension = Extension.create({
  name: "flashcardSeparator",

  // Require necessary extensions, including our custom mark
  addExtensions() {
    return [
      Paragraph,
      Text,
      BackTextMark, // Add our custom mark
    ];
  },

  addInputRules() {
    return [
      // Rule for '>>'
      new InputRule({
        // InputRule constructor takes an object
        find: />>/,
        handler: ({ state, range, commands }) => {
          // Correct handler parameters
          const { tr } = state;
          const start = range.from;
          const end = range.to;

          // Replace '>>' with '→ '
          tr.insertText("→ ", start, end);

          // Apply backText mark to the rest of the paragraph after the arrow
          const $start = tr.doc.resolve(start);
          const paragraphEnd = $start.end();

          // Get the position right after the inserted '→ '
          const backTextStart = start + 2; // +2 for '→ '

          // Only apply if there's text after the arrow in the same paragraph
          if (backTextStart < paragraphEnd) {
            tr.addMark(
              backTextStart,
              paragraphEnd,
              state.schema.marks.backText.create()
            );
          }
          return true; // Indicate that the rule was applied
        },
      }),
      // Rule for '::'
      new InputRule({
        // InputRule constructor takes an object
        find: /::/,
        handler: ({ state, range, commands }) => {
          // Correct handler parameters
          const { tr } = state;
          const start = range.from;
          const end = range.to;

          // Replace '::' with '→ '
          tr.insertText("→ ", start, end);

          // Apply backText mark to the rest of the paragraph after the arrow
          const $start = tr.doc.resolve(start);
          const paragraphEnd = $start.end();

          const backTextStart = start + 2; // +2 for '→ '

          if (backTextStart < paragraphEnd) {
            tr.addMark(
              backTextStart,
              paragraphEnd,
              state.schema.marks.backText.create()
            );
          }
          return true; // Indicate that the rule was applied
        },
      }),
    ];
  },
});
