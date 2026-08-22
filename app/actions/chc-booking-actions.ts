"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { revalidatePath } from "next/cache";

export async function rejectBooking(bookingId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        chcProfile: true
      }
    });

    if (!user || user.role !== "chc" || !user.chcProfile) {
      return { success: false, error: "Only CHC providers can reject bookings." };
    }

    // Verify booking belongs to this CHC
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return { success: false, error: "Booking not found." };
    }

    if (booking.chcId !== user.chcProfile.id) {
      return { success: false, error: "You don't have permission to modify this booking." };
    }

    // Update the booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: "REJECTED"
      }
    });

    revalidatePath("/dashboard/chc/bookings");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting booking:", error);
    return { success: false, error: "Failed to reject booking." };
  }
}

export async function getCHCDrivers() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) return [];

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { chcProfile: true }
    });

    if (!user || !user.chcProfile) return [];

    const drivers = await prisma.driverProfile.findMany({
      where: { assignedCHCId: user.chcProfile.id },
      include: { user: true }
    });

    return drivers;
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return [];
  }
}
