"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { revalidatePath } from "next/cache";

export async function updateDriverProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    
    const licenseNumber = formData.get("licenseNumber") as string;
    const licenseType = formData.get("licenseType") as string;
    const experienceYears = formData.get("experienceYears") as string;

    if (!name || !phone || !licenseNumber || !licenseType) {
      return { success: false, error: "Name, Phone, License Number, and License Type are required." };
    }

    // Wrap in transaction to update both User and DriverProfile
    await prisma.$transaction(async (tx) => {
      // 1. Update User
      const updatedUser = await tx.user.update({
        where: { email: session.user.email },
        data: {
          name,
          phone,
          address: address || null,
          city: city || null,
          state: state || null,
        },
      });

      // 2. Update DriverProfile
      await tx.driverProfile.update({
        where: { userId: updatedUser.id },
        data: {
          licenseNumber,
          licenseType: licenseType as any,
          experienceYears: experienceYears ? parseInt(experienceYears, 10) : 0,
        }
      });
    });

    revalidatePath("/dashboard/driver/profile");
    return { success: true, message: "Profile updated successfully." };
  } catch (error: any) {
    console.error("Error updating driver profile:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "This phone number or license number is already registered." };
    }
    return { success: false, error: "An unexpected error occurred while updating profile." };
  }
}
