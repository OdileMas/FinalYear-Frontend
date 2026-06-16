"use client";

import * as React from "react";
import { ThemeProvider } from "./theme-provider";
import { NextAuthSessionProvider } from "./session-provider";

interface AppProviderProps {
  children: React.ReactNode;
  session: any;
}

export function AppProvider({ children, session }: AppProviderProps) {
  return (
    <ThemeProvider>
      <NextAuthSessionProvider session={session}>
        {children}
      </NextAuthSessionProvider>
    </ThemeProvider>
  );
}
