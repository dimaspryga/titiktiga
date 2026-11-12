"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({ duration: 1.15, smoothWheel: true, anchors: true });
    document.documentElement.classList.add("lenis");
    setLenis(instance);
    let raf = requestAnimationFrame(function loop(time) {
      instance.raf(time);
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      document.documentElement.classList.remove("lenis");
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const hashTarget = window.location.hash
      ? document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
      : null;
    if (hashTarget) {
      if (lenis) {
        lenis.scrollTo(hashTarget, { immediate: true, offset: -96 });
      } else {
        hashTarget.scrollIntoView({ block: "start" });
      }
      return;
    }

    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
