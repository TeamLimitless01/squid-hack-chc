import PusherServer from "pusher";

/**
 * Server-side Pusher instance
 * Used to trigger events from API routes or Server Actions.
 */
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

/**
 * Triggers a real-time update to the specific Farmer, CHC, and Driver
 * involved in the given booking, preventing global broadcasts.
 */
export async function notifyBookingUpdate(bookingId: string) {
  // Dynamically import prisma to avoid issues at edge/client boundaries
  const prisma = (await import("@/src/lib/db")).default;
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      farmerId: true,
      chcId: true,
      assignedDriverId: true
    }
  });

  if (!booking) return;

  const channels = [
    `farmer-${booking.farmerId}`,
    `chc-${booking.chcId}`
  ];

  if (booking.assignedDriverId) {
    channels.push(`driver-${booking.assignedDriverId}`);
  }

  await pusherServer.trigger(channels, 'booking-updated', { bookingId });
}
