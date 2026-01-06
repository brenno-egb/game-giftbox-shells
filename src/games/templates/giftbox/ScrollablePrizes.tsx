import React from "react";

export function InfiniteAutoScrollStrip({
  pool,
  renderItem,
  take = 6,
  durationSec = 10,
}: {
  pool: any[];
  renderItem: (p: any, i: number) => React.ReactNode;
  take?: number;
  durationSec?: number;
}) {
  const items = pool.slice(0, Math.max(1, take));

  if (!items.length) return null;

  return (
    <div className="overflow-hidden relative w-full px-4">
      <div 
        className="flex gap-3 hover:[animation-play-state:paused]"
        style={{
          animation: `scroll-left ${durationSec}s linear infinite`,
        }}
      >
        {[...items, ...items].map((p, i) => (
          <div key={`${p?.id ?? "p"}-${i}`} className="shrink-0 w-24">
            {renderItem(p, i)}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}