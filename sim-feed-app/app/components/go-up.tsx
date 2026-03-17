import { useState, useEffect } from "react";

export function GoUp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={[
        "fixed bottom-8 right-8 z-50",
        "flex items-center justify-center",
        "w-11 h-11 rounded-full",
        "bg-sf-bg-card border border-sf-border-secondary",
        "text-sf-accent-primary",
        "shadow-lg",
        "transition-all duration-300 ease-in-out",
        "hover:bg-sf-bg-card-hover hover:border-sf-border-subtle hover:text-sf-accent-hover hover:scale-110",
        "active:scale-95",
        "cursor-pointer",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
      ].join(" ")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
