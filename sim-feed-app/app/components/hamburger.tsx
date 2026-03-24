type HamburgerButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

export const HamburgerButton = ({ isOpen, onClick }: HamburgerButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="relative w-8 h-8 sm:w-5 sm:h-5 flex flex-col items-center justify-center gap-1.5 z-50"
      aria-label="Toggle navigation menu"
    >
      <span
        className={`w-6 h-0.5 bg-sf-text-primary transition-all duration-300
        ${isOpen ? "rotate-45 translate-y-2" : ""}`}
      />
      <span
        className={`w-6 h-0.5 bg-sf-text-primary transition-all duration-300
        ${isOpen ? "opacity-0" : ""}`}
      />
      <span
        className={`w-6 h-0.5 bg-sf-text-primary transition-all duration-300
        ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}
      />
    </button>
  )
};