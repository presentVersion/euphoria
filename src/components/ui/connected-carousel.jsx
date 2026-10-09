"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const VISIBLE_OFFSETS = [-3, -2, -1, 0, 1, 2, 3];

const TRANSITION_SPRING = {
  type: "spring",
  stiffness: 240,
  damping: 28,
  mass: 0.7,
};

export function CalendlyCarousel({
  items = [],
  autoPlayInterval = 5500,
  pauseOnHover = true,
  className,
  ...props
}) {
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const elapsedRef = useRef(0);

  const [page, setPage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [tier, setTier] = useState("desktop");
  const [viewportWidth, setViewportWidth] = useState(1200);

  const total = items.length;
  const activeIndex = total > 0 ? ((page % total) + total) % total : 0;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      if (width < 640) {
        setTier("mobile");
      } else if (width < 1024) {
        setTier("tablet");
      } else {
        setTier("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (pauseOnHover && isHovered) {
      lastTimeRef.current = null;
      return;
    }

    const step = (timestamp) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      elapsedRef.current += delta;

      if (elapsedRef.current >= autoPlayInterval) {
        elapsedRef.current = 0;
        lastTimeRef.current = null;
        setProgress(0);
        setPage((curr) => curr + 1);
        return;
      }

      setProgress(Math.min((elapsedRef.current / autoPlayInterval) * 100, 100));
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [page, pauseOnHover, isHovered, autoPlayInterval]);

  const handlePrev = useCallback(() => {
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    setProgress(0);
    setPage((curr) => curr - 1);
  }, []);

  const handleNext = useCallback(() => {
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    setProgress(0);
    setPage((curr) => curr + 1);
  }, []);

  const handleSelectTab = (event) => {
    const indexStr = event.currentTarget.dataset.index;
    if (indexStr !== undefined && total > 0) {
      const targetIdx = Number.parseInt(indexStr, 10);
      let diff = targetIdx - activeIndex;

      if (diff > total / 2) {
        diff -= total;
      } else if (diff < -total / 2) {
        diff += total;
      }

      elapsedRef.current = 0;
      lastTimeRef.current = null;
      setProgress(0);
      setPage((curr) => curr + diff);
    }
  };

  const handleSelectCard = (event) => {
    const offsetStr = event.currentTarget.dataset.offset;
    if (offsetStr !== undefined) {
      const offset = Number.parseInt(offsetStr, 10);
      if (offset !== 0) {
        elapsedRef.current = 0;
        lastTimeRef.current = null;
        setProgress(0);
        setPage((curr) => curr + offset);
      }
    }
  };

  // Compact, minimal, and proportional dimensions to prevent oversize glitches and clipping
  const activeDimensions = {
    desktop: { width: 560, height: 280 },
    tablet: { width: 440, height: 260 },
    mobile: { width: Math.min(310, viewportWidth - 32), height: 350 },
  }[tier];

  if (total === 0) return null;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Doctors Overview"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative w-full max-w-[840px] mx-auto flex flex-col items-center select-none outline-none py-1 overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        id="carousel-view-panel"
        role="tabpanel"
        aria-live="polite"
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ height: activeDimensions.height }}
      >
        {VISIBLE_OFFSETS.map((offset) => {
          const virtualIndex = page + offset;
          const itemIndex = ((virtualIndex % total) + total) % total;
          const item = items[itemIndex];
          const isActive = offset === 0;

          const getVariant = () => {
            if (tier === "mobile") {
              const activeW = activeDimensions.width;
              const activeH = activeDimensions.height;
              const gap = 10;
              const peekW = 32;
              const peekH = 290;

              if (offset === 0) {
                return {
                  x: -activeW / 2,
                  y: -activeH / 2,
                  width: activeW,
                  height: activeH,
                  opacity: 1,
                  zIndex: 0,
                  pointerEvents: "auto",
                };
              }
              if (offset === -1) {
                return {
                  x: -activeW / 2 - gap - peekW,
                  y: -peekH / 2,
                  width: peekW,
                  height: peekH,
                  opacity: 0.5,
                  zIndex: 10,
                  pointerEvents: "auto",
                };
              }
              if (offset === 1) {
                return {
                  x: activeW / 2 + gap,
                  y: -peekH / 2,
                  width: peekW,
                  height: peekH,
                  opacity: 0.5,
                  zIndex: 10,
                  pointerEvents: "auto",
                };
              }
              return {
                x: offset < 0 ? -activeW / 2 - 140 : activeW / 2 + 140,
                y: -peekH / 2,
                width: peekW,
                height: peekH,
                opacity: 0,
                zIndex: 0,
                pointerEvents: "none",
              };
            }

            if (tier === "tablet") {
              const activeW = 440;
              const activeH = 260;
              const gap = 12;
              const sideW = 60;
              const sideH = 200;

              if (offset === 0) {
                return {
                  x: -activeW / 2,
                  y: -activeH / 2,
                  width: activeW,
                  height: activeH,
                  opacity: 1,
                  zIndex: 0,
                  pointerEvents: "auto",
                };
              }
              if (offset === -1) {
                return {
                  x: -activeW / 2 - gap - sideW,
                  y: -sideH / 2,
                  width: sideW,
                  height: sideH,
                  opacity: 0.65,
                  zIndex: 10,
                  pointerEvents: "auto",
                };
              }
              if (offset === 1) {
                return {
                  x: activeW / 2 + gap,
                  y: -sideH / 2,
                  width: sideW,
                  height: sideH,
                  opacity: 0.65,
                  zIndex: 10,
                  pointerEvents: "auto",
                };
              }
              return {
                x: offset < 0 ? -activeW / 2 - 150 : activeW / 2 + 150,
                y: -sideH / 2,
                width: 40,
                height: 120,
                opacity: 0,
                zIndex: 0,
                pointerEvents: "none",
              };
            }

            // Desktop dimensions (compact, cleanly bounded)
            switch (offset) {
              case 0:
                return {
                  x: -280,
                  y: -140,
                  width: 560,
                  height: 280,
                  opacity: 1,
                  zIndex: 0,
                  pointerEvents: "auto",
                };
              case -1:
                return {
                  x: -370,
                  y: -100,
                  width: 70,
                  height: 200,
                  opacity: 0.65,
                  zIndex: 10,
                  pointerEvents: "auto",
                };
              case 1:
                return {
                  x: 300,
                  y: -100,
                  width: 70,
                  height: 200,
                  opacity: 0.65,
                  zIndex: 10,
                  pointerEvents: "auto",
                };
              case -2:
                return {
                  x: -435,
                  y: -65,
                  width: 45,
                  height: 130,
                  opacity: 0.35,
                  zIndex: 5,
                  pointerEvents: "auto",
                };
              case 2:
                return {
                  x: 390,
                  y: -65,
                  width: 45,
                  height: 130,
                  opacity: 0.35,
                  zIndex: 5,
                  pointerEvents: "auto",
                };
              default:
                return {
                  x: offset < 0 ? -520 : 520,
                  y: -65,
                  width: 45,
                  height: 130,
                  opacity: 0,
                  zIndex: 0,
                  pointerEvents: "none",
                };
            }
          };

          return (
            <motion.div
              key={virtualIndex}
              data-offset={offset}
              onClick={handleSelectCard}
              initial={false}
              animate={getVariant()}
              transition={TRANSITION_SPRING}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                willChange: "transform",
              }}
              className={cn(
                "rounded-[20px] bg-slate-900 border border-white/10 text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.6)] overflow-hidden",
                !isActive && "cursor-pointer"
              )}
            >
              <div className="size-full overflow-hidden relative">
                {/* Collapsed side card image preview */}
                <motion.div
                  initial={false}
                  animate={{ opacity: isActive ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn("absolute inset-0 p-1.5", isActive && "pointer-events-none")}
                >
                  <div className="size-full rounded-[14px] overflow-hidden bg-slate-800 relative">
                    <img
                      alt={item.author}
                      src={item.defaultImage}
                      draggable={false}
                      className="size-full object-cover"
                    />
                  </div>
                </motion.div>

                {/* Expanded active center card content */}
                <div
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: activeDimensions.width,
                    height: activeDimensions.height,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      x: isActive ? 0 : offset < 0 ? -500 : 500,
                    }}
                    transition={TRANSITION_SPRING}
                    className={cn(
                      "size-full flex flex-col md:flex-row p-5 md:p-6 gap-4 md:gap-5 items-center",
                      !isActive && "pointer-events-none"
                    )}
                  >
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1 gap-2">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          {item.stat}
                        </span>

                        <p className="font-heading text-xs sm:text-sm md:text-base text-slate-200 leading-snug mt-2.5 italic">
                          "{item.quote}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10">
                        <div className="font-bold text-white text-xs sm:text-sm">
                          {item.author}
                        </div>
                        <div className="text-[11px] text-indigo-300 font-mono mt-0.5">
                          {item.role}
                        </div>
                      </div>
                    </div>

                    <div className="relative shrink-0 overflow-hidden rounded-[14px] bg-slate-800 w-[110px] h-[110px] md:w-[150px] md:h-[180px] border border-white/10 shadow-md">
                      <img
                        alt={item.author}
                        src={item.selectedImage}
                        draggable={false}
                        className="size-full object-cover"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tab Pills */}
      <div role="tablist" aria-label="Doctors Overview" className="flex items-center gap-1.5 mt-3">
        {items.map((item, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              data-index={idx}
              id={`carousel-tab-${idx}`}
              onClick={handleSelectTab}
              aria-selected={isSelected}
              className={cn(
                "h-[5px] rounded-full overflow-hidden border-0 p-0 cursor-pointer transition-[width] duration-300 ease-out outline-none",
                isSelected ? "w-[44px] bg-slate-700" : "w-[6px] bg-slate-700 hover:bg-slate-500"
              )}
            >
              {isSelected && (
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{
                    transformOrigin: "0% 50%",
                    transform: `scaleX(${progress / 100})`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
