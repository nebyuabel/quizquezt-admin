// app/dashboard/[subject]/flashcards/new/page.tsx
import { type FC } from "react";
import CreateFlashcardClient from "./EditFlashcardClient";

// Correct the type definition. Next.js passes a direct object, not a Promise.
interface NewFlashcardProps {
  params: {
    subject: string;
  };
}

const Page: FC<NewFlashcardProps> = ({ params }) => {
  return <CreateFlashcardClient params={params} />;
};

export default Page;
