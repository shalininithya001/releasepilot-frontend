
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReleasePilot | Release Assessment",
  description:
    "AI-powered Jira release evidence assessment and reporting dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
