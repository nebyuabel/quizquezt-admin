// app/dashboard/[subject]/flashcards/[cardID]/page.tsx
import { type FC } from "react";
import EditFlashcardClient from "./EditFlashcardClient";

// Correctly type params as a function that returns a Promise
interface FlashcardPageProps {
  params: () => Promise<{ subject: string; cardID: string }>;
}

const Page: FC<FlashcardPageProps> = ({ params }) => {
  return <EditFlashcardClient params={params} />;
};

export default Page;
