// lib/constants.ts

export const ALL_GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
export const MAX_NOTE_LENGTH = 5000;
export const ALL_UNITS_DISPLAY = Array.from(
  { length: 9 },
  (_, i) => `Unit ${i + 1}`
); // "Unit 1" to "Unit 9"
export const ALL_SUBJECTS = [
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Literature",
  "SAT",
  "Economics",
];
// Helper function to generate flexible unit filter string for Supabase 'or' query
export const generateUnitFilter = (unitValue: string): string => {
  if (!unitValue) return ""; // No filter if unitValue is empty

  // Extract the number part from "Unit X" -> "X"
  const unitNumberMatch = unitValue.match(/\d+/);
  const unitNumber = unitNumberMatch ? unitNumberMatch[0] : "";

  // Generate an array of filter conditions for common variations
  const filters: string[] = [
    `unit.eq.${unitValue}`, // Exact match: "Unit 1"
  ];

  if (unitNumber) {
    filters.push(`unit.ilike.u${unitNumber}`); // "u1"
    filters.push(`unit.ilike.unit${unitNumber}`); // "unit1"
  }
  // You can add more variations here if needed, e.g., 'unit 1' (lowercase)
  // But be careful with too many ilike as it can impact performance on large datasets without indexes.
  // For now, this covers the 'Unit X', 'uX', 'unitX' patterns.

  return filters.join(","); // Join with comma for Supabase 'or' query syntax
};
