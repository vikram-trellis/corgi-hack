"use client";

import { useEffect, useState } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if the window width is mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // Matches Tailwind's md breakpoint
    };

    // Set initial value
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return isMobile;
}