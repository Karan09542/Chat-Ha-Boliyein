"use client";

import { useState, useEffect } from "react";

type Size = {
  width: number;
  height: number;
};
const useResize = () => {
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  });

  useEffect(function size() {
    if (typeof window === "undefined") return;
    setSize({ width: window.innerWidth, height: window.innerHeight });
    async function handleSize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    addEventListener("resize", handleSize);
    return () => removeEventListener("resize", handleSize);
  }, []);

  return size;
};

export default useResize;
