"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { notifyBookingUpdate } from "@/src/lib/pusherServer";

export async function assignBookingResources(bookingId: string, driverId: string) {
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
      return { success: false, error: "Only CHC providers can assign resources." };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        chcService: {
          include: {
            service: true
          }
        }
      }
    });

    if (!booking || booking.chcId !== user.chcProfile.id) {
      return { success: false, error: "Booking not found or permission denied." };
    }

    if (booking.bookingStatus !== "ACCEPTED") {
      return { success: false, error: "Can only assign resources to ACCEPTED bookings." };
    }

    // Prepare date range for availability checking (start of day to end of day)
    const bookingDate = new Date(booking.bookingDate);
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

    // Get the required resource types (e.g. ['TRACTOR', 'CULTIVATOR'])
    const requiredTypes = booking.chcService.service.resourcesRequired;
    
    // We will hold the selected equipment IDs here
    const equipmentToAssign: string[] = [];

    for (const type of requiredTypes) {
      // Find an available equipment of this type for this CHC
      // It must NOT be assigned to an active booking on the same day
      const availableEquipment = await prisma.equipment.findFirst({
        where: {
          chcId: user.chcProfile.id,
          type: type,
          status: "available",
          NOT: {
            assignedResources: {
              some: {
                booking: {
                  bookingDate: {
                    gte: startOfDay,
                    lte: endOfDay
                  },
                  bookingStatus: {
                    notIn: ["REJECTED", "CANCELLED"]
                  },
                  workStatus: {
                    not: "COMPLETED"
                  }
                }
              }
            }
          }
        }
      });

      if (!availableEquipment) {
        return { 
          success: false, 
          error: `Insufficient resources. No available equipment of type ${type} found for the scheduled date.` 
        };
      }

      equipmentToAssign.push(availableEquipment.id);
    }

    // If we have all required equipment, update the booking transactionally
    await prisma.$transaction(async (tx) => {
      // Assign the driver
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          assignedDriverId: driverId
        }
      });

      // Clear existing assignments if any (safeguard)
      await tx.assignedResource.deleteMany({
        where: { bookingId }
      });

      // Assign the new resources
      if (equipmentToAssign.length > 0) {
        await tx.assignedResource.createMany({
          data: equipmentToAssign.map(eqId => ({
            bookingId,
            equipmentId: eqId,
            resourceType: "EQUIPMENT"
          }))
        });
      }
    });

    await notifyBookingUpdate(bookingId);
    revalidatePath("/dashboard/chc/bookings");
    return { success: true };
  } catch (error: any) {
    console.error("Error assigning resources:", error);
    return { success: false, error: "Failed to assign resources." };
  }
}
