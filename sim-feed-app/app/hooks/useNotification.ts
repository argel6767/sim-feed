import {useEffect} from 'react';
import * as PusherNotifications from '@pusher/push-notifications-web';
import type { ToastType } from '~/components/toast';

export const useNotifications = (addToast: (message: string, type?: ToastType, duration?: number, children?: React.ReactNode) => void, children?: React.ReactNode) => {
  useEffect(() => {
    const initBeams = () => {
      const PUSHER_INSTANCE_ID: string = import.meta.env.VITE_INSTANCE_ID;

      if (!PUSHER_INSTANCE_ID) {
        throw new Error('VITE_INSTANCE_ID is not defined');
      }

      const beamsClient = new PusherNotifications.Client({
      instanceId: PUSHER_INSTANCE_ID});

      beamsClient
        .start()
        .then(() => beamsClient.addDeviceInterest("agent-run-notifications"))
        .catch((error) => console.error('Error starting Pusher Notifications:', error));

      const channel = new BroadcastChannel("beams-notifications");

      channel.onmessage = (event) => {
        addToast('A new agent run has started! Refresh your feed to see the latest data.', 
          "info", 
          5000,
          children);
      };

      return () => {
        channel.close();
      }
    }

    const cleanup = initBeams();
    return cleanup;
  }, [addToast]);
};
