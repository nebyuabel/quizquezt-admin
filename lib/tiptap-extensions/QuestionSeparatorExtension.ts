// lib/tiptap-extensions/QuestionSeparatorExtension.ts

import { Extension, Mark } from "@tiptap/core";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import { InputRule } from "@tiptap/core";

export const CorrectAnswerMark = Mark.create({
  name: "correctAnswer",

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (node: HTMLElement) =>
          node.classList.contains("correct-answer-indicator") ? {} : false,
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
      new InputRule({
        find: /(>>|::)/,
        handler: ({ state, range }) => {
          const { tr } = state;
          const start = range.from;
          const end = range.to;

          tr.insertText(" ↓", start, end);
          return;
        },
      }),
      new InputRule({
        find: /\/n$/,
        handler: ({ state, range }) => {
          const { tr } = state;
          const start = range.from; // FIX: Corrected typo 'const const' to 'const'
          const end = range.to;

          tr.deleteRange(start, end);
          return;
        },
      }),
      new InputRule({
        find: /(\s*<|\s*\*)$/,
        handler: ({ state, range }) => {
          const { tr } = state;
          const start = range.from;
          const end = range.to;

          tr.deleteRange(start, end);

          const $start = tr.doc.resolve(start);
          const paragraphStart = $start.start();
          const paragraphEnd = $start.end();

          tr.addMark(
            paragraphStart,
            paragraphEnd,
            state.schema.marks.correctAnswer.create()
          );
          return;
        },
      }),
    ];
  },
});
