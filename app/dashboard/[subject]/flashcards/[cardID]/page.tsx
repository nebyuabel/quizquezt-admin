import { type FC } from "react";
import CreateFlashcardClient from "./EditFlashcardClient";

interface NewFlashcardProps {
  params: Promise<{ subject: string }>;
}

const Page: FC<NewFlashcardProps> = ({ params }) => {
  return <CreateFlashcardClient params={params} />;
};

export default Page;
