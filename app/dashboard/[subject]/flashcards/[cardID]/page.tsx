// app/dashboard/[subject]/flashcards/[cardID]/page.tsx
import { type FC } from "react";
import EditFlashcardClient from "./EditFlashcardClient";

// Explicitly type params this way:
// Explicitly type params this way:
interface FlashcardPageProps {
  params: {
    subject: string;
    cardID: string;
  };
}
const Page: FC<FlashcardPageProps> = ({ params }) => {
  return <EditFlashcardClient params={params} />;
};

export default Page;
