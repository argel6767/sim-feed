import { useNotifications } from "~/hooks/useNotification";
import { useToast } from "./toast";
import { useLocation } from "react-router";
import { useGoogleAnalytics } from "~/hooks/useGoogleAnalytics";


export const NotificationHolder = () => {
  const {addToast} = useToast();
  useNotifications(addToast, <a className="text-sf-text-tertiary text-[0.85rem] tracking-[0.5px] uppercase transition-colors duration-300 hover:text-sf-accent-primary motion-preset-fade-sm" href="/feed">Go to Feed</a>);
  
  return (
    <div>
      {/* Render notifications */}
    </div>
  )
  
}

export const GoogleAnalyticsHolder = () => {
  const location = useLocation();
  useGoogleAnalytics(location);
  return (
    <div>
      {/* Render Google Analytics */}
    </div>
  )
  
}
