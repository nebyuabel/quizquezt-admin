// components/IndividualFlashcardInput.tsx
"use client";

import React, { useState, useEffect } from "react";
import { MinusCircle, PlusCircle } from "lucide-react";

// SingleFlashcard type for this component, does NOT include is_premium
interface SingleFlashcard {
  front_text: string;
  back_text: string;
  id?: string;
}

interface IndividualFlashcardInputProps {
  initialCards?: SingleFlashcard[];
  onCardsChange: (cards: SingleFlashcard[]) => void; // Expects array of SingleFlashcard
}

export const IndividualFlashcardInput: React.FC<
  IndividualFlashcardInputProps
> = ({ initialCards = [], onCardsChange }) => {
  const [cards, setCards] = useState<SingleFlashcard[]>(
    initialCards.length > 0 ? initialCards : [{ front_text: "", back_text: "" }]
  );

  const isInitialMount = React.useRef(true);

  useEffect(() => {
    if (
      !isInitialMount.current &&
      initialCards.length > 0 &&
      JSON.stringify(initialCards) !== JSON.stringify(cards)
    ) {
      setCards(initialCards);
    }
  }, [initialCards]);

  useEffect(() => {
    if (!isInitialMount.current) {
      onCardsChange(cards);
    }
  }, [cards, onCardsChange]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  const addCard = () => {
    setCards([...cards, { front_text: "", back_text: "" }]);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      const newCards = cards.filter((_, i) => i !== index);
      setCards(newCards);
    }
  };

  const updateCard = (
    index: number,
    field: "front_text" | "back_text",
    value: string
  ) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  return (
    <div className="space-y-6">
      {cards.map((card, index) => (
        <div
          key={card.id || index}
          className="p-4 bg-gray-700 rounded-lg shadow-inner border border-gray-600"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Flashcard {index + 1}
            </h3>
            {cards.length > 1 && (
              <button
                type="button"
                onClick={() => removeCard(index)}
                className="text-red-400 hover:text-red-500 transition-colors"
              >
                <MinusCircle size={24} />
              </button>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor={`front_text_${index}`}
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Front Text
            </label>
            <textarea
              id={`front_text_${index}`}
              value={card.front_text}
              onChange={(e) => updateCard(index, "front_text", e.target.value)}
              placeholder="e.g., Capital of France"
              rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label
              htmlFor={`back_text_${index}`}
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Back Text
            </label>
            <textarea
              id={`back_text_${index}`}
              value={card.back_text}
              onChange={(e) => updateCard(index, "back_text", e.target.value)}
              placeholder="e.g., Paris"
              rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      ))}
      {initialCards.length === 0 && (
        <button
          type="button"
          onClick={addCard}
          className="w-full flex items-center justify-center px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
        >
          <PlusCircle size={20} className="mr-2" /> Add Another Flashcard
        </button>
      )}
    </div>
  );
};
