"use server";

import prisma from "@/src/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

export async function getUserNotifications(limit = 20) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return [];
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: (session.user as any).id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // We also check recipientId to ensure users can only mark their own notifications
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId: (session.user as any).id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark as read" };
  }
}

export async function markAllNotificationsAsRead() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.notification.updateMany({
      where: {
        recipientId: (session.user as any).id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "Failed to mark all as read" };
  }
}
