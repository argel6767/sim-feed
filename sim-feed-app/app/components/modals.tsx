type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Width class, defaults to "w-full max-w-lg" */
  width?: string;
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  width = "w-full max-w-lg",
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className={`${width} bg-sf-bg-primary border border-sf-border-primary rounded-lg shadow-2xl motion-preset-fade`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-5 border-b border-sf-border-primary">
              <h2 className="text-[1rem] font-bold tracking-[1.5px] uppercase text-sf-text-primary">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-sf-text-tertiary hover:bg-sf-bg-card-hover hover:text-sf-text-primary"
                aria-label="Close modal"
              >
                <svg
                  width="18"
                  height="18"
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
          )}

          {/* If no title, render a floating close button */}
          {!title && (
            <div className="flex justify-end px-4 pt-4">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-sf-text-tertiary hover:bg-sf-bg-card-hover hover:text-sf-text-primary"
                aria-label="Close modal"
              >
                <svg
                  width="18"
                  height="18"
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
          )}

          {/* Content */}
          <div className="px-5 py-5">{children}</div>
        </div>
      </div>
    </>
  );
};

type SidebarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Optional footer content rendered at the bottom of the sidebar */
  footer?: React.ReactNode;
  /** Which edge the sidebar slides in from, defaults to "right" */
  side?: "left" | "right";
  /** Tailwind width class, defaults to "w-72" */
  width?: string;
};

export const SidebarModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  side = "right",
  width = "w-80",
}: SidebarModalProps) => {
  const positionClass = side === "right" ? "right-0" : "left-0";
  const translateClass =
    side === "right"
      ? isOpen
        ? "translate-x-0"
        : "translate-x-full"
      : isOpen
        ? "translate-x-0"
        : "-translate-x-full";

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 ${positionClass} h-full ${width} bg-sf-bg-primary shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${translateClass}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-6 border-b border-sf-border-primary flex items-center justify-between">
            {title ? (
              <h1 className="text-[1.2rem] font-bold tracking-[2px] text-sf-text-primary">
                {title}
              </h1>
            ) : (
              <span />
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-sf-text-primary hover:bg-sf-bg-card-hover"
              aria-label="Close sidebar"
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-sf-border-primary">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
