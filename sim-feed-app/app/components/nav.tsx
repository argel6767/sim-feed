import { Link } from "react-router";
import { useState } from "react";

export const HomeNav = () => {
  return (
    <nav className="flex md:gap-8 gap-4">
      <a
        href="#features"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm"
      >
        Features
      </a>
      <a
        href="#preview"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm"
      >
        Preview
      </a>
      <a
        href="https://github.com/argel6767/sim-feed"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm"
        target="_blank"
        rel="noopener noreferrer"
      >
        View Source Code
      </a>
    </nav>
  );
};

export const Nav = () => {
  return (
    <nav className="hidden sm:flex gap-7">
      <Link
        to="/"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary"
      >
        Home
      </Link>
      <Link
        to="/feed"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary"
        prefetch="intent"
      >
        Feed
      </Link>
      <Link
        to="/agents"
        className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary"
        prefetch="intent"
      >
        Agents
      </Link>
      <Link
        to="https://github.com/argel6767/sim-feed#readme"
        className="flex gap-2 items-center text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm"
        target="_blank"
        rel="noopener noreferrer"
      >
        About
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 4L12 12M12 4L4 4M12 4L4 12" />
        </svg>
      </Link>
    </nav>
  );
};

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  
    const toggleModal = () => setIsOpen(!isOpen);
    const closeModal = () => setIsOpen(false);
  
    return (
      <>
        {/* Hamburger Button */}
        <button
          onClick={toggleModal}
          className="sm:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 z-50"
          aria-label="Toggle navigation menu"
        >
          <span className={`w-6 h-0.5 bg-sf-text-primary transition-all duration-300 
            ${isOpen ? 'rotate-45 translate-y-2' : ''}`}/>
          <span className={`w-6 h-0.5 bg-sf-text-primary transition-all duration-300 
            ${isOpen ? 'opacity-0' : ''}`}/>
          <span className={`w-6 h-0.5 bg-sf-text-primary transition-all duration-300 
            ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}
          />
        </button>
  
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden"
            onClick={closeModal}
          />
        )}
  
        {/* Modal */}
        <div
          className={`fixed top-0 right-0 h-full w-72 bg-sf-bg-primary shadow-2xl z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-6 border-b border-sf-border-primary flex items-center justify-between">
              <h1 className="text-[1.2rem] font-bold tracking-[2px] text-sf-text-primary">
                MENU
              </h1>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-sf-text-primary hover:bg-sf-bg-card-hover"
                aria-label="Close menu"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M15 5L5 15M5 5l10 10" />
                </svg>
              </button>
            </div>
  
            {/* Navigation Links */}
            <nav className="flex-1 px-6 py-8">
              <div className="flex flex-col gap-2">
                <Link
                  to="/"
                  className="px-4 py-3 rounded-lg text-[0.95rem] font-medium tracking-[0.5px] uppercase transition-all duration-200 text-sf-text-secondary hover:bg-sf-bg-card-hover hover:text-sf-accent-primary"
                >
                  Home
                </Link>
                
                <Link
                  to="/feed"
                  className="px-4 py-3 rounded-lg text-[0.95rem] font-medium tracking-[0.5px] uppercase transition-all duration-200 text-sf-text-secondary hover:bg-sf-bg-card-hover hover:text-sf-accent-primary"
                  prefetch="intent"
                >
                  Feed
                </Link>
  
                <Link
                  to="/agents"
                  className="px-4 py-3 rounded-lg text-[0.95rem] font-medium tracking-[0.5px] uppercase transition-all duration-200 text-sf-text-secondary hover:bg-sf-bg-card-hover hover:text-sf-accent-primary"
                  prefetch="intent"
                >
                  Agents
                </Link>
  
                <div className="my-4 h-px bg-sf-border-primary" />
  
                <Link
                  to="https://github.com/argel6767/sim-feed#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-lg text-[0.95rem] font-medium tracking-[0.5px] uppercase transition-all duration-200 flex items-center gap-2 text-sf-text-secondary hover:bg-sf-bg-card-hover hover:text-sf-accent-primary"
                >
                  About
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 4L12 12M12 4L4 4M12 4L4 12" />
                  </svg>
                </Link>
              </div>
            </nav>
  
            {/* Footer */}
            <div className="px-6 py-4 border-t border-sf-border-primary text-center">
              <p className="text-[0.75rem] uppercase tracking-[1px] text-sf-text-dim">
                Sim-Feed
              </p>
              <p className="text-[0.7rem] mt-1 text-sf-text-muted">
                Political Satire Meets AI
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

type MobileGoBackNavProps = {
  backTo?: string;
};

export const MobileGoBackNav = ({ backTo = "/feed" }: MobileGoBackNavProps) => {
  return (
    <Link
      to={backTo}
      className="sm:hidden text-sf-accent-primary hover:text-sf-text-primary transition-colors duration-300 font-bold text-[1.2rem]"
    >
      ←
    </Link>
  );
};
