"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { notifyBookingUpdate } from "@/src/lib/pusherServer";

async function verifyDriverAuth(bookingId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { driverProfile: true }
  });

  if (!user || user.role !== "driver" || !user.driverProfile) {
    throw new Error("Only drivers can perform this action.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking || booking.assignedDriverId !== user.driverProfile.id) {
    throw new Error("Booking not found or not assigned to you.");
  }

  return booking;
}

export async function startTrip(bookingId: string) {
  try {
    const booking = await verifyDriverAuth(bookingId);

    if (booking.tripStatus !== "NOT_STARTED") {
      return { success: false, error: "Trip has already been started." };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        tripStatus: "STARTED",
        tripStarted: true,
        tripStartTime: new Date(),
      }
    });
    await notifyBookingUpdate(bookingId);
    revalidatePath("/dashboard/driver/trips");
    return { success: true };
  } catch (error: any) {
    console.error("Error starting trip:", error);
    return { success: false, error: error.message || "Failed to start trip." };
  }
}

export async function startWork(bookingId: string) {
  try {
    const booking = await verifyDriverAuth(bookingId);

    if (booking.tripStatus !== "STARTED") {
      return { success: false, error: "You must start the trip before starting work." };
    }
    if (booking.workStatus !== "NOT_STARTED") {
      return { success: false, error: "Work has already been started." };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        tripStatus: "ARRIVED",
        workStatus: "IN_PROGRESS",
        workStarted: true,
        workStartTime: new Date(),
      }
    });

    await notifyBookingUpdate(bookingId);
    revalidatePath("/dashboard/driver/trips");
    return { success: true };
  } catch (error: any) {
    console.error("Error starting work:", error);
    return { success: false, error: error.message || "Failed to start work." };
  }
}

export async function endWork(bookingId: string) {
  try {
    const booking = await verifyDriverAuth(bookingId);

    if (booking.workStatus !== "IN_PROGRESS") {
      return { success: false, error: "Work must be in progress to end it." };
    }

    const fullBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { chcService: true, additionalCharges: true }
    });

    if (!fullBooking) {
      return { success: false, error: "Booking details not found." };
    }

    const endTime = new Date();
    let updateData: any = {
      workStatus: "COMPLETED",
      workEndTime: endTime,
    };

    if (fullBooking.chcService.pricingUnit === 'HOUR' && fullBooking.workStartTime) {
      const diffMs = endTime.getTime() - fullBooking.workStartTime.getTime();
      // Minimum billing of 1 minute (0.02 hours) to avoid 0 charge on rapid testing
      const rawHours = diffMs / (1000 * 60 * 60);
      const hours = Math.max(rawHours, 0.02);
      const billedHours = Number(hours.toFixed(2));

      const newBasePrice = billedHours * fullBooking.chcService.price;
      const addCharges = fullBooking.additionalCharges.reduce((sum, c) => sum + c.amount, 0);

      updateData.vpBasePrice = newBasePrice;
      updateData.vpFinalAmount = newBasePrice + addCharges;
      updateData.area = billedHours; // Update area (quantity) to reflect actual hours billed
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: updateData
    });

    await notifyBookingUpdate(bookingId);
    revalidatePath("/dashboard/driver/trips");
    return { success: true };
  } catch (error: any) {
    console.error("Error ending work:", error);
    return { success: false, error: error.message || "Failed to end work." };
  }
}

export async function closeJob(bookingId: string) {
  try {
    const booking = await verifyDriverAuth(bookingId);

    if (booking.workStatus !== "COMPLETED") {
      return { success: false, error: "Work must be completed first." };
    }

    const fullBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true }
    });

    if (fullBooking?.payment?.status !== "PAID") {
      return { success: false, error: "Cannot close job until payment is received." };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        workCompleteTime: new Date(),
      }
    });

    await notifyBookingUpdate(bookingId);
    revalidatePath("/dashboard/driver/trips");
    return { success: true };
  } catch (error: any) {
    console.error("Error closing job:", error);
    return { success: false, error: error.message || "Failed to close job." };
  }
}

export async function confirmCashAndCloseJob(bookingId: string) {
  try {
    const booking = await verifyDriverAuth(bookingId);

    if (booking.workStatus !== "COMPLETED") {
      return { success: false, error: "Work must be completed first." };
    }

    const fullBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true }
    });

    if (fullBooking?.payment?.method !== "CASH" || fullBooking.payment.status !== "CASH_PENDING") {
      return { success: false, error: "No pending cash payment found." };
    }

    // Mark payment as paid, close the job, and release the equipment together.
    // Service availability is derived from these assignments, so this makes the
    // CHC service bookable again after cash payment is confirmed.
    await prisma.$transaction(async (transaction) => {
      await transaction.payment.update({
        where: { id: fullBooking.payment.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      await transaction.booking.update({
        where: { id: bookingId },
        data: {
          workCompleteTime: new Date(),
        },
      });

      await transaction.assignedResource.deleteMany({
        where: { bookingId },
      });
    });

    await notifyBookingUpdate(bookingId);
    revalidatePath("/dashboard/driver/trips");
    return { success: true };
  } catch (error: any) {
    console.error("Error confirming cash payment:", error);
    return { success: false, error: error.message || "Failed to confirm payment." };
  }
}
