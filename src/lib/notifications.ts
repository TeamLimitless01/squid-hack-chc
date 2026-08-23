import prisma from "@/src/lib/db";
import { pusherServer } from "@/src/lib/pusherServer";
import { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  bookingId?: string;
  paymentId?: string;
}

export async function createAndSendNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        recipientId: params.recipientId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        bookingId: params.bookingId,
        paymentId: params.paymentId,
      }
    });

    // Broadcast to the specific user's channel
    await pusherServer.trigger(`user-notifications-${params.recipientId}`, 'new-notification', notification);

    return notification;
  } catch (error) {
    console.error("Failed to create/send notification:", error);
    return null;
  }
}
