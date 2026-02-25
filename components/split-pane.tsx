"use client";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export function SplitPane({ left, right, className = "" }: SplitPaneProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 ${className}`}
    >
      <div className="flex flex-col min-h-[300px]">{left}</div>
      <div className="flex flex-col min-h-[300px] animate-slide-in">{right}</div>
    </div>
  );
}
