import EditFlashcardClient from "./EditFlashcardClient";

export default function Page({
  params,
}: {
  params: { subject: string; cardID: string };
}) {
  return <EditFlashcardClient params={params} />;
}
