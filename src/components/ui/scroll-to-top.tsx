import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ScrollToTopProps {
  scrollableRef?: React.RefObject<HTMLDivElement>;
  threshold?: number;
  className?: string;
}

export const ScrollToTop = ({ 
  scrollableRef, 
  threshold = 300,
  className 
}: ScrollToTopProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      let scrollTop = 0;
      
      if (scrollableRef?.current) {
        scrollTop = scrollableRef.current.scrollTop;
      } else {
        scrollTop = window.scrollY;
      }

      setVisible(scrollTop > threshold);
    };

    const element = scrollableRef?.current || window;
    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [scrollableRef, threshold]);

  const scrollToTop = () => {
    if (scrollableRef?.current) {
      scrollableRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed bottom-24 right-4 z-50 rounded-full shadow-lg opacity-90 hover:opacity-100 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 transition-all duration-300",
        className
      )}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};
