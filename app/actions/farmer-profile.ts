"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/src/lib/db";
import { revalidatePath } from "next/cache";

export async function updateFarmerProfile(formData: FormData) {
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
    const locationStr = formData.get("location") as string;

    let location = undefined;
    if (locationStr) {
      try {
        location = JSON.parse(locationStr);
      } catch (e) {
        console.error("Invalid location JSON");
      }
    }

    if (!name || !phone) {
      return { success: false, error: "Name and Phone are required." };
    }

    // Update the user record
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone,
        address: address || null,
        city: city || null,
        state: state || null,
        ...(location ? { location } : {}),
      },
    });

    // Revalidate the path to show fresh data
    revalidatePath("/dashboard/farmer/profile");

    return { success: true, message: "Profile updated successfully." };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('phone')) {
      return { success: false, error: "This phone number is already registered." };
    }
    return { success: false, error: "An unexpected error occurred while updating profile." };
  }
}
