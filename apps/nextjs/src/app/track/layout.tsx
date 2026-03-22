import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order | SEFARI",
  description: "Track your SEFARI delivery in real-time with live driver tracking and estimated arrival times.",
  icons: {
    icon: [
      { url: "/sefari-logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/sefari-logo.svg",
  },
};


export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 antialiased">
      {children}
    </div>
  );
}
