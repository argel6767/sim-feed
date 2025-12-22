import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  children?: React.ReactNode;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    children?: React.ReactNode,
  ) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

type ToastProviderProps = {
  children: React.ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      duration = 4000,
      children?: React.ReactNode,
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type, duration, children }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

type ToastContainerProps = {
  toasts: Toast[];
  removeToast: (id: string) => void;
};

const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

type ToastItemProps = {
  toast: Toast;
  onDismiss: () => void;
};

const toastConfig: Record<
  ToastType,
  { icon: string; borderColor: string; iconBg: string }
> = {
  success: {
    icon: "✓",
    borderColor: "border-l-green-500",
    iconBg: "bg-green-500/20 text-green-400",
  },
  error: {
    icon: "✕",
    borderColor: "border-l-red-500",
    iconBg: "bg-red-500/20 text-red-400",
  },
  warning: {
    icon: "!",
    borderColor: "border-l-sf-accent-primary",
    iconBg: "bg-sf-accent-primary/20 text-sf-accent-primary",
  },
  info: {
    icon: "i",
    borderColor: "border-l-blue-400",
    iconBg: "bg-blue-400/20 text-blue-400",
  },
};

const ToastItem = ({ toast, onDismiss }: ToastItemProps) => {
  const { message, type, duration = 4000, children } = toast;
  const config = toastConfig[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div
      className={`
        pointer-events-auto
        bg-sf-bg-card border border-sf-border-primary border-l-4 ${config.borderColor}
        rounded-lg p-4 shadow-lg
        flex items-start gap-3
        motion-preset-slide-left-sm
        transition-all duration-300
        hover:border-sf-border-secondary hover:bg-sf-bg-card-hover
      `}
      role="alert"
    >
      <div
        className={`
          w-6 h-6 rounded-full flex items-center justify-center
          text-[0.75rem] font-bold shrink-0
          ${config.iconBg}
        `}
      >
        {config.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[0.9rem] text-sf-text-primary leading-relaxed break-words">
          {message}
        </p>
        {children && <div className="mt-3">{children}</div>}
      </div>

      <button
        onClick={onDismiss}
        className="
          shrink-0 w-6 h-6 flex items-center justify-center
          text-sf-text-dim text-[0.85rem]
          rounded transition-colors duration-300
          hover:text-sf-text-primary hover:bg-sf-border-primary
          cursor-pointer
        "
        aria-label="Dismiss toast"
      >
        ✕
      </button>
    </div>
  );
};

// Standalone toast component for direct usage without context
type StandaloneToastProps = {
  message: string;
  type?: ToastType;
  onDismiss?: () => void;
  duration?: number;
  children?: React.ReactNode;
};

export const Toast = ({
  message,
  type = "info",
  onDismiss,
  duration = 4000,
  children,
}: StandaloneToastProps) => {
  const config = toastConfig[type];

  useEffect(() => {
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div
      className={`
        bg-sf-bg-card border border-sf-border-primary border-l-4 ${config.borderColor}
        rounded-lg p-4 shadow-lg
        flex items-start gap-3
        motion-preset-slide-left-sm
        transition-all duration-300
        hover:border-sf-border-secondary hover:bg-sf-bg-card-hover
      `}
      role="alert"
    >
      <div
        className={`
          w-6 h-6 rounded-full flex items-center justify-center
          text-[0.75rem] font-bold shrink-0
          ${config.iconBg}
        `}
      >
        {config.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[0.9rem] text-sf-text-primary leading-relaxed break-words">
          {message}
        </p>
        {children && <div className="mt-3">{children}</div>}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="
            shrink-0 w-6 h-6 flex items-center justify-center
            text-sf-text-dim text-[0.85rem]
            rounded transition-colors duration-300
            hover:text-sf-text-primary hover:bg-sf-border-primary
            cursor-pointer
          "
          aria-label="Dismiss toast"
        >
          ✕
        </button>
      )}
    </div>
  );
};
