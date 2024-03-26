 import { useEffect } from "react";

export const useWindowScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};