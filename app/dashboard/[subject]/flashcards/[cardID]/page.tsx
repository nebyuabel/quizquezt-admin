// app/dashboard/[subject]/flashcards/[cardID]/page.tsx
import { type FC } from "react";
import EditFlashcardClient from "./EditFlashcardClient";

interface FlashcardPageProps {
  params: Promise<{ subject: string; cardID: string }>;
}

const Page: FC<FlashcardPageProps> = async ({ params }) => {
  return <EditFlashcardClient params={params} />;
};

export default Page;
