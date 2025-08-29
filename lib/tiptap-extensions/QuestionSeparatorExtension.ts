// lib/tiptap-extensions/QuestionSeparatorExtension.ts
import { Extension, Mark, InputRule } from "@tiptap/core";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";

export const CorrectAnswerMark = Mark.create({
  name: "correctAnswer",

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (el: HTMLElement) =>
          el.classList.contains("correct-answer-indicator") ? {} : false,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      { class: "correct-answer-indicator", ...HTMLAttributes },
      0,
    ];
  },
});

export const QuestionSeparatorExtension = Extension.create({
  name: "questionSeparator",

  addExtensions() {
    return [Paragraph, Text, CorrectAnswerMark];
  },

  addInputRules() {
    return [
      // If someone types ">>" / "::" in questions, just insert the "↓" symbol (no split)
      new InputRule({
        find: /(>>|::)$/,
        handler: ({ state, range }) => {
          const { tr } = state;
          tr.insertText(" ↓", range.from, range.to);
        },
      }),

      // Remove a literal "/n" if pasted from instructions
      new InputRule({
        find: /\/n$/,
        handler: ({ state, range }) => {
          const { tr } = state;
          tr.deleteRange(range.from, range.to);
        },
      }),

      // Turn a trailing "<" into a visual mark on the option line
      new InputRule({
        find: /\s*<$/,
        handler: ({ state, range }) => {
          const { tr } = state;
          const start = range.from;
          const end = range.to;

          // remove the "<"
          tr.deleteRange(start, end);

          // mark the entire current paragraph as the "correct answer"
          const $pos = tr.doc.resolve(start);
          const pStart = $pos.start();
          const pEnd = $pos.end();

          tr.addMark(pStart, pEnd, state.schema.marks.correctAnswer.create());
        },
      }),
    ];
  },
});
