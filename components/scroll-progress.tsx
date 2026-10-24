"use client";
import { useEffect, useRef } from "react";
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const total =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress =
          total > 0 ? Math.max(0, Math.min(1, window.scrollY / total)) : 0;
        if (ref.current) ref.current.style.transform = `scaleX(${progress})`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
