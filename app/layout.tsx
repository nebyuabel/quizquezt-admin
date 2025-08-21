// app/layout.tsx
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuizQuest Admin",
  description: "Admin dashboard for QuizQuest.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
