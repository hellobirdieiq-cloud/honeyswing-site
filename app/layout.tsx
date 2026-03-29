import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HoneySwing — AI Swing Analysis for Junior Golfers",
  description:
    "AI-powered swing analysis to help coaches track progress and accelerate improvement for young athletes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
