import { useEffect } from "react"
import ReactGA from "react-ga4";
import { useLocation } from "react-router";

export const useGoogleAnalytics = (location: ReturnType<typeof useLocation>) => {
  const GA_TRACKING_ID: string = import.meta.env.VITE_GA_TRACKING_ID;
  
  useEffect(() => {
    if (!GA_TRACKING_ID) return;
    ReactGA.initialize(GA_TRACKING_ID);
  }, []);

  useEffect(() => {
    if (!GA_TRACKING_ID) return;
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname,
    });
  }, [location, GA_TRACKING_ID]);
}