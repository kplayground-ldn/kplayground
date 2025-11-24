import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K-Playground Community",
  description: "Community board for sharing and discussing products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
