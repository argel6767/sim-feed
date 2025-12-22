importScripts("https://js.pusher.com/beams/service-worker.js");

const channel = new BroadcastChannel("beams-notifications");

PusherPushNotifications.onNotificationReceived = ({ pushEvent, payload, handleNotification }) => {
  pushEvent.waitUntil(handleNotification(payload));
  channel.postMessage(payload);
};