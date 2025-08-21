// lib/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  subject: string | null;
  loading: boolean;
  login: (
    inputSubject: string,
    password: string
  ) => { success: boolean; error: string | null };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [subject, setSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Define subject passwords by reading from environment variables
  const subjectPasswords: Record<string, string> = {
    Math: process.env.NEXT_PUBLIC_MATH_PASSWORD || "",
    Physics: process.env.NEXT_PUBLIC_PHYSICS_PASSWORD || "",
    Chemistry: process.env.NEXT_PUBLIC_CHEMISTRY_PASSWORD || "",
    Biology: process.env.NEXT_PUBLIC_BIOLOGY_PASSWORD || "",
    History: process.env.NEXT_PUBLIC_HISTORY_PASSWORD || "",
    Geography: process.env.NEXT_PUBLIC_GEOGRAPHY_PASSWORD || "",
    Literature: process.env.NEXT_PUBLIC_LITERATURE_PASSWORD || "",
    SAT: process.env.NEXT_PUBLIC_SAT_PASSWORD || "",
  };

  // ADD THIS LINE

  useEffect(() => {
    // Check local storage for an existing session
    const storedSubject = localStorage.getItem("admin-subject");
    if (storedSubject) {
      setSubject(storedSubject);
    }
    setLoading(false);
  }, []);

  const login = (inputSubject: string, password: string) => {
    const correctPassword = subjectPasswords[inputSubject];

    if (correctPassword && password === correctPassword) {
      setSubject(inputSubject); // This triggers a state change
      localStorage.setItem("admin-subject", inputSubject);
      return { success: true, error: null };
    } else {
      return { success: false, error: "Incorrect subject or password." };
    }
  };
  const logout = () => {
    setSubject(null);
    localStorage.removeItem("admin-subject");
  };

  return (
    <AuthContext.Provider value={{ subject, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
