interface ErrorProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const Error = ({ message, onRetry, onDismiss }: ErrorProps) => {
  return (
    <div className={"bg-sf-bg-card border border-red-500/30 rounded-lg p-4 mb-4 motion-preset-fade"}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-red-500 text-[0.95rem] font-medium mb-3">
            {message}
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.5px] bg-red-500/20 text-red-400 border border-red-500/40 rounded transition-all duration-300 hover:bg-red-500/30 hover:border-red-500/60 cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-sf-text-dim hover:text-sf-text-primary transition-colors duration-300 text-xl leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
