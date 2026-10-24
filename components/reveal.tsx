"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export default function Reveal() {
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.animate(
            [{ transform: "translateY(14px)" }, { transform: "translateY(0)" }],
            { duration: 450, easing: "cubic-bezier(.2,.7,.2,1)" },
          );
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".module-card,.content-card,.care-card")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [path]);
  return null;
}
