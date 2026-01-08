import React, { useEffect, useMemo, useRef } from "react";

export function InfiniteAutoScrollStrip({
  pool,
  renderItem,
  take = 6,
  speedPxPerSec = 18,  // suave
  pauseOnInteract = true,
  resumeAfterMs = 900,
}: {
  pool: any[];
  renderItem: (p: any, i: number) => React.ReactNode;
  take?: number;
  speedPxPerSec?: number;
  pauseOnInteract?: boolean;
  resumeAfterMs?: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);

  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number>(0);

  const baseWidthRef = useRef<number>(0);

  const interactingRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);

  const baseItems = useMemo(() => {
    const arr = (pool ?? []).slice(0, Math.max(1, take));
    return arr;
  }, [pool, take]);

  const items = useMemo(() => {
    if (!baseItems.length) return [];
    return baseItems.concat(baseItems);
  }, [baseItems]);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const start = () => {
    stop();
    lastTRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  };

  const scheduleResume = () => {
    if (!pauseOnInteract) return;
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      interactingRef.current = false;
      start();
    }, resumeAfterMs);
  };

  const onInteractStart = () => {
    if (!pauseOnInteract) return;
    interactingRef.current = true;
    stop();
    scheduleResume();
  };

  const onInteractEnd = () => {
    if (!pauseOnInteract) return;
    scheduleResume();
  };

  const tick = (t: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // se user tá interagindo, não auto-scroll
    if (pauseOnInteract && interactingRef.current) return;

    if (!lastTRef.current) lastTRef.current = t;
    const dt = (t - lastTRef.current) / 1000;
    lastTRef.current = t;

    const baseW = baseWidthRef.current;

    // se ainda não mediu, tenta no próximo frame
    if (!baseW || baseW < 2) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    scroller.scrollLeft += speedPxPerSec * dt;

    // WRAP: quando passar do tamanho da 1ª cópia, volta
    if (scroller.scrollLeft >= baseW) {
      scroller.scrollLeft -= baseW;
    } else if (scroller.scrollLeft < 0) {
      scroller.scrollLeft += baseW;
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    const base = baseRef.current;
    if (!scroller || !base || !baseItems.length) return;

    // mede largura da PRIMEIRA CÓPIA (baseRef)
    const measure = () => {
      // scrollWidth do base = largura total dos itens + gaps
      baseWidthRef.current = base.scrollWidth;
      // garante que começa no range correto
      if (scroller.scrollLeft >= baseWidthRef.current && baseWidthRef.current > 0) {
        scroller.scrollLeft = scroller.scrollLeft % baseWidthRef.current;
      }
    };

    // mede agora e depois quando layout mudar (imagens, resize)
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(base);

    // iOS / imagens: mede também depois de um tempinho (bem leve)
    const t1 = window.setTimeout(measure, 50);
    const t2 = window.setTimeout(measure, 250);

    // listeners de interação REAL (não usa "scroll"!)
    const opts: AddEventListenerOptions = { passive: true };
    scroller.addEventListener("pointerdown", onInteractStart, opts);
    scroller.addEventListener("pointerup", onInteractEnd, opts);
    scroller.addEventListener("pointercancel", onInteractEnd, opts);
    scroller.addEventListener("touchstart", onInteractStart, opts);
    scroller.addEventListener("touchend", onInteractEnd, opts);
    scroller.addEventListener("wheel", onInteractStart, opts);

    // inicia
    interactingRef.current = false;
    start();

    return () => {
      stop();
      ro.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);

      scroller.removeEventListener("pointerdown", onInteractStart);
      scroller.removeEventListener("pointerup", onInteractEnd);
      scroller.removeEventListener("pointercancel", onInteractEnd);
      scroller.removeEventListener("touchstart", onInteractStart);
      scroller.removeEventListener("touchend", onInteractEnd);
      scroller.removeEventListener("wheel", onInteractStart);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseItems.length, speedPxPerSec, pauseOnInteract, resumeAfterMs]);

  if (!baseItems.length) return null;

  return (
    <div
      ref={scrollerRef}
      className="
        overflow-x-auto
        whitespace-nowrap
        px-4 pb-2
        [-webkit-overflow-scrolling:touch]
      "
      style={{
        // importante: não usar scroll-smooth aqui (pode atrapalhar em alguns browsers)
        scrollBehavior: "auto",
      }}
    >
      {/* base (1ª cópia) - usada só pra medir */}
      <div ref={baseRef} className="inline-flex gap-3">
        {baseItems.map((p, i) => (
          <div key={`${p?.id ?? "p"}-base-${i}`} className="shrink-0 w-24">
            {renderItem(p, i)}
          </div>
        ))}
      </div>

      {/* segunda cópia - loop */}
      <div className="inline-flex gap-3">
        {baseItems.map((p, i) => (
          <div key={`${p?.id ?? "p"}-dup-${i}`} className="shrink-0 w-24">
            {renderItem(p, i)}
          </div>
        ))}
      </div>
    </div>
  );
}
