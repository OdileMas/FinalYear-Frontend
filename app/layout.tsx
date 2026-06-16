import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/app/providers/app-provider";
import { SonnerProvider } from "@/components/ui/sonner";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Irondo ry'Umwuga - Smart Security System",
  description: "AI-powered surveillance and security management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white text-gray-900 transition-colors duration-300`}>
        <AppProvider session={null}>
          {children}
          <SonnerProvider position="top-right" richColors theme="system" />
        </AppProvider>
      </body>
    </html>
  );
}
