"use client"

import React, { useEffect } from "react";

type OutSideCloseProps = {
  setState:
    | React.Dispatch<React.SetStateAction<boolean | string>>
    | ((arg: any) => void);
  ref: React.RefObject<HTMLElement | null>;
  arg: boolean | string;
};
function outSideClose({ setState, ref, arg }: OutSideCloseProps) {
  return useEffect(() => {
    function handleClick(e: PointerEvent) {
      // ref.current && !ref.current.contains(e.target as Node);
      // or
      if (
        ref.current &&
        e.target instanceof Node &&
        !ref.current.contains(e.target)
      ) {
        setState(arg);
      }
    }
    window.addEventListener("pointerdown", handleClick);
    return () => window.removeEventListener("pointerdown", handleClick);
  }, [setState, ref, arg]);
}

export default outSideClose;
