import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Engineering — Command Center",
  description: "Plateforme centrale d'ingénierie et de supervision logicielle. Audit IA, architecture et gestion de versions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
