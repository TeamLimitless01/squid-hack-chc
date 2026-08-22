"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { notifyBookingUpdate } from "@/src/lib/pusherServer";

export async function sendBookingProposal(
  bookingId: string,
  basePrice: number,
  finalAmount: number,
  additionalCharges: { reason: string, amount: number }[]
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { chcProfile: true }
    });

    if (!user || user.role !== "chc" || !user.chcProfile) {
      return { success: false, error: "Only CHC providers can send proposals." };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking || booking.chcId !== user.chcProfile.id) {
      return { success: false, error: "Booking not found or permission denied." };
    }

    // Use a transaction to create additional charges and update the booking
    await prisma.$transaction(async (tx) => {
      // 1. Update Booking
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          vpBasePrice: basePrice,
          vpFinalAmount: finalAmount,
          vpProposedAt: new Date(),
          vpFarmerApproved: false // reset just in case
        }
      });

      // 2. Clear old charges if any
      await tx.additionalCharge.deleteMany({
        where: { bookingId }
      });

      // 3. Add new charges
      if (additionalCharges.length > 0) {
        await tx.additionalCharge.createMany({
          data: additionalCharges.map(charge => ({
            bookingId,
            reason: charge.reason,
            amount: charge.amount
          }))
        });
      }
    });

    await notifyBookingUpdate(bookingId);
    revalidatePath("/dashboard/chc/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Error sending proposal:", error);
    return { success: false, error: "Failed to send proposal." };
  }
}

export async function approveProposal(bookingId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const farmer = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!farmer || farmer.role !== "farmer") {
      return { success: false, error: "Only farmers can approve proposals." };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking || booking.farmerId !== farmer.id) {
      return { success: false, error: "Booking not found or permission denied." };
    }

    if (!booking.vpProposedAt) {
      return { success: false, error: "No proposal to approve." };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: "ACCEPTED",
        vpFarmerApproved: true,
        vpFarmerApprovedAt: new Date()
      }
    });

    await notifyBookingUpdate(bookingId);
    revalidatePath("/dashboard/farmer/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Error approving proposal:", error);
    return { success: false, error: "Failed to approve proposal." };
  }
}

export async function rejectProposalByFarmer(bookingId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const farmer = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!farmer || farmer.role !== "farmer") {
      return { success: false, error: "Only farmers can reject proposals." };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking || booking.farmerId !== farmer.id) {
      return { success: false, error: "Booking not found or permission denied." };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: "REJECTED"
      }
    });

    await notifyBookingUpdate(bookingId);
    revalidatePath("/dashboard/farmer/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting proposal:", error);
    return { success: false, error: "Failed to reject proposal." };
  }
}
