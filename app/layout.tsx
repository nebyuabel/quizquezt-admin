// app/layout.tsx
import "./globals.css"; // Import global CSS (Tailwind)
import { Inter } from "next/font/google"; // Import Inter font
import { AuthProvider } from "@/lib/AuthContext"; // Import your AuthContext

const inter = Inter({ subsets: ["latin"] });

// Metadata for your application
export const metadata = {
  title: "QuizQuest Admin",
  description: "Admin panel for managing QuizQuest content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      {" "}
      {/* Use dark mode class if desired */}
      <body className={inter.className}>
        {/* Wrap your entire application with AuthContextProvider */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
