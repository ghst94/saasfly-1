import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order | SEFARI",
  description: "Track your SEFARI delivery in real-time with live driver tracking and estimated arrival times.",
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
