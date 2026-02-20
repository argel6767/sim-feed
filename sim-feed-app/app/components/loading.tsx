import {useState, useEffect } from 'react';
import {useNavigation} from 'react-router';
export const LoadingBar = () => {
  const {state} = useNavigation();
  const [progress, setProgress] = useState<number>(0);
  
  useEffect(() => {
      if (state !== 'loading') {
        setProgress(100);
        const timer = setTimeout(() => setProgress(0), 300);
        return () => clearTimeout(timer);
      }
  
      setProgress(0);
      const initialTimer = setTimeout(() => setProgress(30), 100);
  
      const intervals = [
        { target: 60, time: 800 },
        { target: 80, time: 1500 },
        { target: 90, time: 2500 },
        { target: 95, time: 4000 },
      ];
  
      const timers = intervals.map(({ target, time }) =>
        setTimeout(() => {
          setProgress(prev => prev < target ? target : prev);
        }, time)
      );
  
      return () => {
        clearTimeout(initialTimer);
        timers.forEach(clearTimeout);
      };
    }, [state]);
  
    if (progress === 0) return null;
    
    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-sf-bg-card-hover">
          <div
            className="h-full transition-all duration-300 ease-out bg-sf-accent-primary"
            style={{ 
              width: `${progress}%`,
              opacity: progress === 100 ? 0 : 1,
            }}
          />
        </div>
      );
}