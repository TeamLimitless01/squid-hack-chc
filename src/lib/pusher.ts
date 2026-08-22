import PusherClient from "pusher-js";

/**
 * Client-side Pusher instance
 * Used to subscribe to events in React components.
 * This is a singleton to prevent multiple connections.
 */
export const pusherClient =
  typeof window !== "undefined"
    ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
    : null;

