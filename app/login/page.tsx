// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext"; // Ensure this is AuthProvider if you renamed it
import { ALL_SUBJECTS } from "@/lib/constants"; // Import ALL_SUBJECTS

export default function LoginPage() {
  const { subject, loading, login } = useAuth(); // Use useAuth as per your context
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  useEffect(() => {
    if (subject) {
      router.push(`/dashboard/${subject.toLowerCase()}`);
    }
  }, [subject, router]);

  const handleLogin = (e: React.FormEvent) => {
    // Removed 'async' keyword as login is synchronous
    e.preventDefault();
    setLoginLoading(true);
    setError(null);

    if (!selectedSubject || !password) {
      setError("Please select a subject and enter a password.");
      setLoginLoading(false);
      return;
    }

    const result = login(selectedSubject, password); // FIX: Removed 'await' as login is synchronous

    if (result.success) {
      // The useEffect above will handle the redirect once 'subject' state updates in AuthContext
    } else {
      setError(result.error);
    }
    setLoginLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-white">
          QuizQuest Admin
        </h2>
        <p className="text-gray-400 text-center">
          Enter your subject password to continue
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select a subject...</option>
              {ALL_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-400">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"} // Toggles between 'text' and 'password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
            >
              <span className="text-gray-400 hover:text-white transition-colors">
                {showPassword ? "Hide" : "Show"}
              </span>
            </button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {loginLoading ? "Authenticating..." : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
