"use client";

import * as React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  React.useEffect(() => {
    window.document.documentElement.classList.remove("dark");
  }, []);

  return <>{children}</>;
}
