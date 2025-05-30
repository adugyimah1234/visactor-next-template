import { useContext } from "react";
import { OverlayContext } from "@/components/Overlay";

export const useOverlay = () => {
  const { openOverlay } = useContext(OverlayContext)!;
  return { openOverlay };
};
